export * from "@creatorpulse/shared";

/**
 * Transport-level (HTTP) throttling. Product/credit limits live in
 * @creatorpulse/shared so the frontend can read them too.
 */
export const HTTP_LIMITS = {
  /** Default budget for any route that does not override it (per IP). */
  default: { limit: 120, ttl: 60_000 },
  /** AI tool endpoints are expensive; keep them tighter than reads. */
  ai: { limit: 30, ttl: 60_000 },
  /** Auth endpoints (per IP). */
  register: { limit: 5, ttl: 600_000 },
  login: { limit: 10, ttl: 600_000 },
} as const;

const isTest = () => process.env.NODE_ENV === "test";

/** Tests issue far more requests than production; never let them trip the limiter. */
export function scaleLimit(limit: number): number {
  return isTest() ? limit * 1000 : limit;
}

/**
 * Per-route `@Throttle` override that respects the test multiplier, so
 * `HTTP_LIMITS` stays the single source of truth for every route class.
 *
 *   @Throttle(routeThrottle(HTTP_LIMITS.ai))
 */
export function routeThrottle(preset: { limit: number; ttl: number }) {
  return { default: { limit: scaleLimit(preset.limit), ttl: preset.ttl } };
}

export function throttlerConfig() {
  return [
    {
      name: "default",
      ttl: HTTP_LIMITS.default.ttl,
      limit: scaleLimit(HTTP_LIMITS.default.limit),
    },
  ];
}

/**
 * Global AI kill-switch. Set AI_ENABLED=false to turn every LLM-backed
 * tool off without a deploy. Guarded before quota is consumed so nobody
 * loses a credit when AI is down.
 */
export function isAiEnabled(): boolean {
  return process.env.AI_ENABLED !== "false";
}
