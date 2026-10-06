import { Injectable } from "@nestjs/common";
import {
  ThrottlerStorage,
  ThrottlerStorageService,
} from "@nestjs/throttler";
import { RedisService } from "./redis.service";

/** Shape of `ThrottlerStorage['increment']`'s result (not re-exported by the package). */
interface ThrottleRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

/**
 * Fixed-window counter with an optional block period, shared across every
 * backend instance via Redis.
 *
 * Behaviour mirrors `ThrottlerStorageService` (the in-process default):
 *   - `limit` requests are allowed per window,
 *   - the next request trips `isBlocked` for `blockDuration`,
 *   - when the block expires the window restarts.
 *
 * If Redis is unavailable we hand off to the in-process storage, so rate
 * limiting never becomes a hard dependency.
 */
const INCREMENT_SCRIPT = `
local ttl = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local blockDuration = tonumber(ARGV[3])

local blockPttl = redis.call('PTTL', KEYS[2])
if blockPttl > 0 then
  local hits = tonumber(redis.call('GET', KEYS[2]) or '0')
  local pttl = redis.call('PTTL', KEYS[1])
  if pttl < 0 then pttl = ttl end
  return {hits, pttl, 1, blockPttl}
end

local hits = redis.call('INCR', KEYS[1])
if hits == 1 then
  redis.call('PEXPIRE', KEYS[1], ttl)
end
local pttl = redis.call('PTTL', KEYS[1])
if pttl <= 0 then
  redis.call('PEXPIRE', KEYS[1], ttl)
  pttl = ttl
end

if hits > limit then
  if blockDuration > 0 then
    redis.call('SET', KEYS[2], hits, 'PX', blockDuration)
    redis.call('PEXPIRE', KEYS[1], blockDuration)
    return {hits, blockDuration, 1, blockDuration}
  end
  return {hits, pttl, 1, pttl}
end

return {hits, pttl, 0, 0}
`;

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly memory = new ThrottlerStorageService();

  constructor(private readonly redis: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottleRecord> {
    const remote = await this.redis.run((r) =>
      r.eval(
        INCREMENT_SCRIPT,
        2,
        key,
        `${key}:blocked`,
        ttl,
        limit,
        Math.max(0, blockDuration),
      ),
    );

    if (Array.isArray(remote)) {
      const [hits, pttl, blocked, blockPttl] = remote as number[];
      return {
        totalHits: Number(hits),
        timeToExpire: Math.ceil(Number(pttl) / 1000),
        isBlocked: Number(blocked) === 1,
        timeToBlockExpire:
          Number(blocked) === 1 ? Math.ceil(Number(blockPttl) / 1000) : 0,
      };
    }

    return this.memory.increment(key, ttl, limit, blockDuration, throttlerName);
  }
}
