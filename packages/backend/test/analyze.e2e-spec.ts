import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { GroqService } from "../src/common/groq.service";
import { RedisService } from "../src/redis/redis.service";
import { LIMITS } from "../src/common/config/limits";
import { validationPipeOptions } from "../src/common/validation";

const TEST_PASSWORD = "AnalyzeE2E!123";

/**
 * The e2e suite exercises HTTP wiring, quota and persistence — not the model.
 * A deterministic stub keeps it free, fast and immune to Groq rate limits.
 * Run with E2E_LIVE=1 to hit the real API instead.
 */
function groqStub() {
  const analysis = {
    emotionalTriggers: ["curiosity", "aspiration"],
    hookType: "how-to",
    psychology: {
      curiosity: 78,
      authority: 61,
      novelty: 55,
      emotion: 49,
      conflict: 42,
      specificity: 70,
      urgency: 38,
    },
    targetAudience: "First-time creators who feel stuck at under 1k subscribers.",
    ctrExplanation: "The number promises a concrete, measurable outcome.",
    whyItWorks: "Specific promise plus a timeframe creates an information gap.",
  };
  const titles = {
    titles: [
      { title: "How I Gained 1,000 Subscribers in 30 Days", pattern: "How-to", whyWorks: "Specific outcome." },
      { title: "7 Subscriber Mistakes Killing Your Channel", pattern: "Listicle", whyWorks: "Loss aversion." },
      { title: "Why Your Shorts Get Zero Views", pattern: "Question", whyWorks: "Direct pain point." },
    ],
  };
  const description = {
    description: "Hook line\n\nBody copy with takeaways.",
    chapters: [
      { time: "0:00", label: "Hook" },
      { time: "1:12", label: "The mistake" },
    ],
    hashtags: ["#youtubegrowth", "#creator"],
  };

  const impl = async (prompt: string) => {
    if (prompt.includes("YouTube video description")) return JSON.stringify(description);
    if (prompt.includes("generate 5 structurally similar titles")) return JSON.stringify(titles);
    return JSON.stringify(analysis);
  };

  if (process.env.E2E_LIVE === "1") return undefined;
  return { call: jest.fn(impl), extractJson: (t: string) => t, safeParse: JSON.parse };
}

describe("Analyze (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  const testEmail = `e2e-analyze-${Date.now()}@example.com`;

  beforeAll(async () => {
    const stub = groqStub();
    let builder = Test.createTestingModule({ imports: [AppModule] });
    if (stub) builder = builder.overrideProvider(GroqService).useValue(stub);

    const moduleFixture: TestingModule = await builder.compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
    await app.init();

    prisma = app.get(PrismaService);

    // Guest counters live in Redis when REDIS_URL is set, so they survive
    // between runs. Start every suite from a clean per-IP budget.
    await app.get(RedisService).run(async (r) => {
      const keys = await r.keys("cp:guest:*");
      if (keys.length) await r.del(...keys);
      return true;
    });

    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: testEmail,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        displayName: "Analyze E2E",
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: testEmail, password: TEST_PASSWORD })
      .expect(201);

    token = loginRes.body.access_token;
    expect(token).toBeDefined();
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.dailyUsage.deleteMany({ where: { userId: user.id } });
      await prisma.generation.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await app.close();
  });

  describe("POST /api/analyze", () => {
    beforeEach(async () => {
      // Free accounts get LIMITS.freeDailyCredits/day; reset so each test
      // exercises the happy path instead of tripping the quota guard.
      await prisma.dailyUsage.deleteMany({
        where: { user: { email: testEmail } },
      });
    });

    it("returns virality analysis for a valid title", () => {
      return request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "How to Grow Your YouTube Channel in 2024" })
        .expect(201)
        .expect((res) => {
          expect(res.body.analysis).toBeDefined();
          expect(res.body.analysis.computedViralityScore).toBeGreaterThanOrEqual(0);
          expect(res.body.analysis.computedViralityScore).toBeLessThanOrEqual(100);
          expect(res.body.analysis.powerWords).toBeDefined();
          expect(Array.isArray(res.body.analysis.patterns)).toBe(true);
          expect(res.body.analysis.readabilityScore).toBeDefined();
        });
    });

    it("returns alternatives and a description alongside the analysis", () => {
      return request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "I Tested 7 Viral Hooks So You Don't Have To" })
        .expect(201)
        .expect((res) => {
          expect(Array.isArray(res.body.titles)).toBe(true);
          expect(res.body.titles.length).toBeGreaterThan(0);
          expect(typeof res.body.titles[0].title).toBe("string");

          expect(res.body.description).toBeDefined();
          expect(typeof res.body.description.description).toBe("string");
          expect(Array.isArray(res.body.description.chapters)).toBe(true);
          expect(Array.isArray(res.body.description.hashtags)).toBe(true);
        });
    });

    it("rejects empty title", () => {
      return request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "" })
        .expect(400);
    });

    it("rejects titles below the length floor with a readable message", () => {
      return request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Nope" })
        .expect(400)
        .expect((res) => {
          expect(String(res.body.message)).toContain("at least 10 characters");
        });
    });

    it("rejects nonsense titles without spending a credit or saving a row", async () => {
      const generationsBefore = await prisma.generation.count({
        where: { user: { email: testEmail } },
      });

      const res = await request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "jflaklsdgkljaslgj" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_INPUT");
      expect(typeof res.body.error).toBe("string");
      expect(res.body.error.length).toBeGreaterThan(10);

      const usage = await request(app.getHttpServer())
        .get("/api/usage")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(usage.body.used).toBe(0);

      const generationsAfter = await prisma.generation.count({
        where: { user: { email: testEmail } },
      });
      expect(generationsAfter).toBe(generationsBefore);
    });

    it("rejects single-word and symbol-only titles", async () => {
      await request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Unboxing" })
        .expect(400);

      await request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "!!! @@@ ### ???" })
        .expect(400);
    });

    it("handles optional niche", () => {
      return request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Quick Tips for Productivity", niche: "productivity" })
        .expect(201)
        .expect((res) => {
          expect(res.body.analysis).toBeDefined();
        });
    });

    it("does not leak internal scratch fields", () => {
      return request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Why Nobody Watches Your Shorts" })
        .expect(201)
        .expect((res) => {
          expect(res.body._preA).toBeUndefined();
          expect(res.body._context).toBeUndefined();
          expect(res.body.analysis._pre).toBeUndefined();
        });
    });

    it("records the generation against the signed-in user", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "The One Metric That Predicts Virality" })
        .expect(201);

      expect(res.body.analysis.userContext).toBeDefined();
      expect(res.body.analysis.userContext.totalAnalyses).toBeGreaterThanOrEqual(1);

      const usage = await request(app.getHttpServer())
        .get("/api/usage")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(usage.body.isAuthenticated).toBe(true);
      expect(usage.body.tier).toBe("free");
      expect(usage.body.used).toBe(1);
      expect(usage.body.limit).toBe(LIMITS.freeDailyCredits);
      expect(usage.body.remaining).toBe(LIMITS.freeDailyCredits - 1);
    });

    it("blocks a free account once the daily budget is spent", async () => {
      for (let i = 0; i < LIMITS.freeDailyCredits; i++) {
        await request(app.getHttpServer())
          .post("/api/analyze")
          .set("Authorization", `Bearer ${token}`)
          .send({ title: `Free tier run number ${i + 1}` })
          .expect(201);
      }

      const blocked = await request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "One run too many" });

      expect(blocked.status).toBe(429);
      expect(blocked.body.code).toBe("LIMIT_REACHED");
      expect(blocked.body.guest).toBeUndefined();
    });
  });

  describe("guest access", () => {
    it("runs without an Authorization header", async () => {
      await request(app.getHttpServer())
        .post("/api/analyze")
        .send({ title: "How I Gained 10k Subscribers in 30 Days" })
        .expect(201);

      const usage = await request(app.getHttpServer())
        .get("/api/usage")
        .expect(200);

      expect(usage.body.isAuthenticated).toBe(false);
      expect(usage.body.tier).toBe("guest");
      expect(usage.body.limit).toBe(LIMITS.guestDailyCredits);
      expect(usage.body.used).toBe(1);
    });

    it("enforces the per-IP guest budget and then returns 429", async () => {
      const spent = LIMITS.guestDailyCredits - 1;
      for (let i = 0; i < spent; i++) {
        await request(app.getHttpServer())
          .post("/api/analyze")
          .send({ title: `Guest run number ${i + 2}` })
          .expect(201);
      }

      const blocked = await request(app.getHttpServer())
        .post("/api/analyze")
        .send({ title: "One run too many" });

      expect(blocked.status).toBe(429);
      expect(blocked.body.code).toBe("LIMIT_REACHED");
      expect(blocked.body.guest).toBe(true);

      const usage = await request(app.getHttpServer())
        .get("/api/usage")
        .expect(200);
      expect(usage.body.used).toBe(LIMITS.guestDailyCredits);
      expect(usage.body.remaining).toBe(0);
    });
  });
});
