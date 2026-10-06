import {
  Injectable,
  NotFoundException,
  HttpException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { MESSAGES, dailyCreditsForTier, LIMITS } from "../common/config/limits";

interface GuestCounter {
  day: string;
  count: number;
}

const GUEST_STORE_MAX = 20000;
const GUEST_REDIS_PREFIX = "cp:guest";

@Injectable()
export class UsageService {
  /**
   * Guest quota: per-IP, per-calendar-day, shared across every AI endpoint.
   * Counters live in Redis when `REDIS_URL` is configured so every backend
   * instance sees the same budget; otherwise they are tracked in-process.
   */
  private guestUsage = new Map<string, GuestCounter>();

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private today(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private tomorrow(): Date {
    const d = this.today();
    d.setDate(d.getDate() + 1);
    return d;
  }

  private normalizeIp(ip?: string | null): string {
    return (ip || "unknown").trim().toLowerCase();
  }

  private guestKey(ip?: string): string {
    return `${GUEST_REDIS_PREFIX}:${this.today().toISOString()}:${this.normalizeIp(ip)}`;
  }

  async getUsage(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const usage = await this.prisma.dailyUsage.findUnique({
      where: { userId_date: { userId, date: this.today() } },
    });

    const used = usage?.count ?? 0;
    const limit = dailyCreditsForTier(user.tier);

    return {
      isAuthenticated: true,
      tier: user.tier,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      hasAnalyzedToday: used > 0,
    };
  }

  /**
   * Single entry point used by every AI tool. Signed-in users spend their
   * daily credits; guests spend the per-IP guest quota.
   */
  async consume(userId?: string | null, ip?: string) {
    if (userId) return this.checkAndIncrement(userId);
    if (ip) return this.checkAndIncrementGuest(ip);
    throw new UnauthorizedException({ error: "Sign in to continue" });
  }

  async checkAndIncrement(userId: string) {
    await this.check(userId);
    await this.increment(userId);
  }

  async check(userId: string) {
    const used = await this.prisma.dailyUsage.findUnique({
      where: { userId_date: { userId, date: this.today() } },
    });
    const current = used?.count ?? 0;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const limit = dailyCreditsForTier(user?.tier);

    if (current >= limit) {
      throw new HttpException({ error: MESSAGES.limitReached, code: "LIMIT_REACHED" }, 429);
    }
  }

  async increment(userId: string) {
    await this.prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: this.today() } },
      update: { count: { increment: 1 } },
      create: { userId, date: this.today(), count: 1 },
    });
  }

  async getGuestUsage(ip?: string) {
    const key = this.guestKey(ip);
    const remote = await this.redis.run(async (r) => {
      const raw = await r.get(key);
      return raw === null ? 0 : Number(raw);
    });

    const used = remote ?? this.guestUsedInMemory(ip);
    return {
      isAuthenticated: false,
      tier: "guest",
      used,
      limit: LIMITS.guestDailyCredits,
      remaining: Math.max(0, LIMITS.guestDailyCredits - used),
      hasAnalyzedToday: used > 0,
    };
  }

  async checkAndIncrementGuest(ip?: string) {
    const key = this.guestKey(ip);
    const result = await this.redis.run(async (r) => {
      const count = await r.incr(key);
      if (count === 1) {
        const ttlSeconds = Math.max(
          1,
          Math.round((this.tomorrow().getTime() - Date.now()) / 1000),
        );
        await r.expire(key, ttlSeconds);
      }
      if (count > LIMITS.guestDailyCredits) {
        // Roll back so an exhausted IP does not keep inflating its counter.
        await r.decr(key);
        return { allowed: false };
      }
      return { allowed: true };
    });

    if (result) {
      if (result.allowed) return;
      throw new HttpException(
        {
          error: MESSAGES.guestLimitReached,
          code: "LIMIT_REACHED",
          guest: true,
        },
        429,
      );
    }

    // Redis unavailable — keep the per-process counter.
    this.checkGuest(ip);
    this.incrementGuest(ip);
  }

  private guestUsedInMemory(ip?: string): number {
    const key = this.normalizeIp(ip);
    const day = this.today().toISOString();
    const rec = this.guestUsage.get(key);
    return rec && rec.day === day ? rec.count : 0;
  }

  private checkGuest(ip?: string) {
    const used = this.guestUsedInMemory(ip);
    if (used >= LIMITS.guestDailyCredits) {
      throw new HttpException(
        { error: MESSAGES.guestLimitReached, code: "LIMIT_REACHED", guest: true },
        429,
      );
    }
  }

  private incrementGuest(ip?: string) {
    const key = this.normalizeIp(ip);
    const day = this.today().toISOString();
    this.evictStaleGuests(day);

    const rec = this.guestUsage.get(key);
    if (!rec || rec.day !== day) {
      this.guestUsage.set(key, { day, count: 1 });
    } else {
      rec.count += 1;
    }
  }

  private evictStaleGuests(currentDay: string) {
    if (this.guestUsage.size < GUEST_STORE_MAX) return;
    for (const [key, rec] of this.guestUsage) {
      if (rec.day !== currentDay) this.guestUsage.delete(key);
    }
    if (this.guestUsage.size >= GUEST_STORE_MAX) this.guestUsage.clear();
  }

  async resetDailyUsage(userId: string) {
    await this.prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: this.today() } },
      update: { count: 0 },
      create: { userId, date: this.today(), count: 0 },
    });
  }
}
