import { HttpException, UnauthorizedException } from "@nestjs/common";
import { UsageService } from "./usage.service";
import {
  HTTP_LIMITS,
  LIMITS,
  MESSAGES,
  dailyCreditsForTier,
  routeThrottle,
  throttlerConfig,
} from "../common/config/limits";

interface PrismaMock {
  user: { findUnique: jest.Mock };
  dailyUsage: { findUnique: jest.Mock; upsert: jest.Mock; deleteMany: jest.Mock };
}

function prismaStub(): PrismaMock {
  return {
    user: { findUnique: jest.fn().mockResolvedValue(null) },
    dailyUsage: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  };
}

async function expectHttpError(
  work: Promise<unknown>,
  status: number,
  code?: string,
) {
  let caught: any;
  try {
    await work;
  } catch (e) {
    caught = e;
  }
  expect(caught).toBeInstanceOf(HttpException);
  expect(caught.getStatus()).toBe(status);
  if (code) expect(caught.getResponse()).toMatchObject({ code });
}

/** Redis is optional — `run()` returning null puts the service in fallback mode. */
function redisDown() {
  return { run: jest.fn().mockResolvedValue(null) } as any;
}

/** Minimal in-RAM Redis stand-in covering GET/INCR/EXPIRE. */
function redisUp() {
  const store = new Map<string, { value: number; expiresAt: number }>();
  const alive = (key: string) => {
    const rec = store.get(key);
    if (!rec || rec.expiresAt < Date.now()) {
      store.delete(key);
      return undefined;
    }
    return rec;
  };
  const client = {
    get: jest.fn(async (key: string) => {
      const rec = alive(key);
      return rec ? String(rec.value) : null;
    }),
    incr: jest.fn(async (key: string) => {
      const rec = alive(key);
      if (rec) {
        rec.value += 1;
        return rec.value;
      }
      store.set(key, { value: 1, expiresAt: Date.now() + 86_400_000 });
      return 1;
    }),
    expire: jest.fn(async (key: string, seconds: number) => {
      const rec = alive(key);
      if (rec) rec.expiresAt = Date.now() + seconds * 1000;
      return 1;
    }),
    decr: jest.fn(async (key: string) => {
      const rec = alive(key);
      if (rec) {
        rec.value = Math.max(0, rec.value - 1);
        return rec.value;
      }
      store.set(key, { value: 0, expiresAt: Date.now() + 86_400_000 });
      return 0;
    }),
  };
  return {
    redis: { run: jest.fn(async (work: (c: typeof client) => Promise<any>) => work(client)) },
    client,
    store,
  };
}

describe("UsageService", () => {
  let service: UsageService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = prismaStub();
    service = new UsageService(prisma as any, redisDown());
  });

  describe("guest quota", () => {
    it("allows the free guest budget, then blocks with 429 LIMIT_REACHED", async () => {
      for (let i = 0; i < LIMITS.guestDailyCredits; i++) {
        await expect(service.consume(undefined, "1.2.3.4")).resolves.toBeUndefined();
      }

      await expectHttpError(
        service.consume(undefined, "1.2.3.4"),
        429,
        "LIMIT_REACHED",
      );
    });

    it("reports remaining credits as they are consumed", async () => {
      expect(await service.getGuestUsage("1.2.3.4")).toMatchObject({
        isAuthenticated: false,
        tier: "guest",
        used: 0,
        limit: LIMITS.guestDailyCredits,
        remaining: LIMITS.guestDailyCredits,
      });

      await service.consume(undefined, "1.2.3.4");

      expect(await service.getGuestUsage("1.2.3.4")).toMatchObject({
        used: 1,
        remaining: LIMITS.guestDailyCredits - 1,
        hasAnalyzedToday: true,
      });
    });

    it("keeps quotas isolated per IP", async () => {
      for (let i = 0; i < LIMITS.guestDailyCredits; i++) {
        await service.consume(undefined, "1.1.1.1");
      }

      await expect(service.consume(undefined, "1.1.1.1")).rejects.toBeInstanceOf(
        HttpException,
      );
      await expect(service.consume(undefined, "2.2.2.2")).resolves.toBeUndefined();
    });

    it("normalizes IP casing and whitespace", async () => {
      await service.consume(undefined, "  1.2.3.4 ");
      expect((await service.getGuestUsage("1.2.3.4")).used).toBe(1);
      expect((await service.getGuestUsage("1.2.3.4".toUpperCase())).used).toBe(1);
    });

    it("expires the counter when the calendar day rolls over", async () => {
      const day = service["today"]().toISOString();
      for (let i = 0; i < LIMITS.guestDailyCredits; i++) {
        await service.consume(undefined, "3.3.3.3");
      }
      expect(() => service["checkGuest"]("3.3.3.3")).toThrow();

      service["guestUsage"].set("3.3.3.3", { day: "2000-01-01T00:00:00.000Z", count: 99 });

      expect((await service.getGuestUsage("3.3.3.3")).used).toBe(0);
      expect((await service.getGuestUsage("3.3.3.3")).remaining).toBe(LIMITS.guestDailyCredits);
      await expect(service.consume(undefined, "3.3.3.3")).resolves.toBeUndefined();
      expect((await service.getGuestUsage("3.3.3.3")).used).toBe(1);
      expect(day).toBeDefined();
    });
  });

  describe("guest quota via Redis", () => {
    it("counts and blocks through Redis when it is available", async () => {
      const { redis, client } = redisUp();
      const svc = new UsageService(prisma as any, redis as any);

      for (let i = 0; i < LIMITS.guestDailyCredits; i++) {
        await expect(svc.consume(undefined, "9.9.9.9")).resolves.toBeUndefined();
      }

      await expectHttpError(svc.consume(undefined, "9.9.9.9"), 429, "LIMIT_REACHED");

      expect(client.incr).toHaveBeenCalledTimes(LIMITS.guestDailyCredits + 1);
      expect((await svc.getGuestUsage("9.9.9.9")).used).toBe(
        LIMITS.guestDailyCredits,
      );
      expect((await svc.getGuestUsage("9.9.9.9")).remaining).toBe(0);
    });

    it("stays in Redis rather than duplicating state in-process", async () => {
      const { redis } = redisUp();
      const svc = new UsageService(prisma as any, redis as any);

      await svc.consume(undefined, "8.8.8.8");

      expect(svc["guestUsage"].size).toBe(0);
      expect(await svc.getGuestUsage("7.7.7.7")).toMatchObject({ used: 0 });
    });

    it("hands the key a TTL so counters do not pile up", async () => {
      const { redis, client } = redisUp();
      const svc = new UsageService(prisma as any, redis as any);

      await svc.consume(undefined, "6.6.6.6");

      expect(client.expire).toHaveBeenCalledTimes(1);
      expect(client.expire.mock.calls[0][1]).toBeGreaterThan(0);
      expect(client.expire.mock.calls[0][1]).toBeLessThanOrEqual(86_400);
    });
  });

  describe("signed-in quota", () => {
    it("throws 429 LIMIT_REACHED once the free daily budget is spent", async () => {
      prisma.user.findUnique.mockResolvedValue({ tier: "free" });
      prisma.dailyUsage.findUnique.mockResolvedValue({
        count: LIMITS.freeDailyCredits,
      });

      await expect(service.consume("user-1", "1.2.3.4")).rejects.toMatchObject({
        status: 429,
        response: { code: "LIMIT_REACHED" },
      });
    });

    it("allows requests while credits remain", async () => {
      prisma.user.findUnique.mockResolvedValue({ tier: "free" });
      prisma.dailyUsage.findUnique.mockResolvedValue({ count: 2 });

      await expect(service.consume("user-1")).resolves.toBeUndefined();
      expect(prisma.dailyUsage.upsert).toHaveBeenCalled();
    });

    it("falls back to the free budget when the user row is missing", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.dailyUsage.findUnique.mockResolvedValue(null);

      await expect(service.consume("ghost")).resolves.toBeUndefined();
    });

    it("requires credentials when neither a user nor an IP is available", async () => {
      await expect(service.consume()).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe("tier budgets", () => {
    it("maps tiers to the shared daily budget", () => {
      expect(dailyCreditsForTier("free")).toBe(LIMITS.freeDailyCredits);
      expect(dailyCreditsForTier(null)).toBe(LIMITS.freeDailyCredits);
      expect(dailyCreditsForTier(undefined)).toBe(LIMITS.freeDailyCredits);
      expect(dailyCreditsForTier("pro")).toBe(LIMITS.proDailyCredits);
      expect(dailyCreditsForTier("agency")).toBe(LIMITS.proDailyCredits);
    });

    it("keeps the zero-credit state distinct from an exhausted one", async () => {
      prisma.user.findUnique.mockResolvedValue({ tier: "free" });
      prisma.dailyUsage.findUnique.mockResolvedValue(null);

      const usage = await service.getUsage("user-1");
      expect(usage).toMatchObject({
        isAuthenticated: true,
        tier: "free",
        used: 0,
        limit: LIMITS.freeDailyCredits,
        remaining: LIMITS.freeDailyCredits,
        hasAnalyzedToday: false,
      });
    });
  });

  describe("HTTP throttling config", () => {
    it("registers exactly one throttler named default", () => {
      const cfg = throttlerConfig();
      expect(cfg).toHaveLength(1);
      expect(cfg[0].name).toBe("default");
      expect(cfg[0].ttl).toBe(HTTP_LIMITS.default.ttl);
    });

    it("scales limits up under NODE_ENV=test so suites are never throttled", () => {
      expect(process.env.NODE_ENV).toBe("test");
      const cfg = throttlerConfig();
      expect(cfg[0].limit).toBeGreaterThanOrEqual(HTTP_LIMITS.default.limit * 1000);
    });

    it("scales per-route @Throttle overrides too", () => {
      expect(routeThrottle(HTTP_LIMITS.ai).default).toEqual({
        limit: HTTP_LIMITS.ai.limit * 1000,
        ttl: HTTP_LIMITS.ai.ttl,
      });
      expect(routeThrottle(HTTP_LIMITS.register).default.ttl).toBe(
        HTTP_LIMITS.register.ttl,
      );
    });

    it("keeps AI routes tighter than the default budget", () => {
      expect(HTTP_LIMITS.ai.limit).toBeLessThan(HTTP_LIMITS.default.limit);
      expect(HTTP_LIMITS.register.limit).toBeLessThan(HTTP_LIMITS.default.limit);
      expect(HTTP_LIMITS.login.limit).toBeLessThan(HTTP_LIMITS.default.limit);
    });
  });

  describe("limit copy", () => {
    it("advertises the real Pro budget in the limit message", () => {
      expect(MESSAGES.limitReached).toContain(String(LIMITS.proDailyCredits));
      expect(MESSAGES.guestLimitReached).toContain(String(LIMITS.freeDailyCredits));
    });
  });
});
