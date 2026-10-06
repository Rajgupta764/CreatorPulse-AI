import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

/** After a Redis failure, stop hitting it for this long so requests stay fast. */
const PAUSE_AFTER_ERROR_MS = 5_000;

/**
 * Thin wrapper around a single shared Redis connection.
 *
 * Redis is optional: if `REDIS_URL` is unset, or the server is unreachable,
 * every `run()` returns `null` and callers fall back to in-process state.
 * That keeps local dev and the test suite working without a Redis container.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private pausedUntil = 0;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.log(
        "REDIS_URL not set — rate limits and guest quota run in-process.",
      );
      return;
    }

    this.client = new Redis(url, {
      lazyConnect: true,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times: number) => Math.min(times * 500, 5_000),
    });

    this.client.on("error", (err: Error) => {
      this.pausedUntil = Date.now() + PAUSE_AFTER_ERROR_MS;
      this.logger.warn(`Redis error (${err.message}) — in-process fallback.`);
    });

    this.client.connect().then(
      () => this.logger.log(`Connected to Redis at ${new URL(url).host}`),
      (err: Error) =>
        this.logger.warn(`Redis connect failed (${err.message}) — in-process fallback.`),
    );
  }

  get isReady(): boolean {
    return this.client?.status === "ready" && Date.now() >= this.pausedUntil;
  }

  /**
   * Run a Redis command. Returns `null` when Redis is not usable so the caller
   * can fall back instead of failing the request.
   */
  async run<T>(work: (redis: Redis) => Promise<T>): Promise<T | null> {
    if (!this.isReady || !this.client) return null;
    try {
      return await work(this.client);
    } catch (err) {
      this.pausedUntil = Date.now() + PAUSE_AFTER_ERROR_MS;
      this.logger.warn(
        `Redis command failed (${(err as Error).message}) — in-process fallback.`,
      );
      return null;
    }
  }

  onModuleDestroy() {
    this.client?.disconnect(false);
  }
}
