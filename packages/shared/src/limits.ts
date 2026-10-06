export const TIERS = {
  FREE: "free",
  PRO: "pro",
  AGENCY: "agency",
} as const;

export type Tier = (typeof TIERS)[keyof typeof TIERS];

export const LIMITS = {
  /** Free tier: 3 credits per day (playbook 2.2). */
  freeDailyCredits: 3,
  /** Pro fair-use ceiling, marketed as unlimited. */
  proDailyCredits: 100,
  /** Guests: 3 per day per IP, shared across all AI endpoints. */
  guestDailyCredits: 3,
  /** History: free sees the last 5 items, Pro sees everything. */
  historyFreeLimit: 5,
  historyProLimit: 50,
  /** Comment mining: free runs cap at ~20 comments. */
  commentsFreeCap: 20,
} as const;

export const TIERS_REQUIRING_PRO = ["Title Battle"] as const;

export function dailyCreditsForTier(tier: string | null | undefined): number {
  return tier === TIERS.PRO || tier === TIERS.AGENCY
    ? LIMITS.proDailyCredits
    : LIMITS.freeDailyCredits;
}

export function historyLimitForTier(tier: string | null | undefined): number {
  return tier === TIERS.PRO || tier === TIERS.AGENCY
    ? LIMITS.historyProLimit
    : LIMITS.historyFreeLimit;
}

export const MESSAGES = {
  limitReached: `Daily generation limit reached. Upgrade to Pro for ${LIMITS.proDailyCredits}/day.`,
  aiDisabled: "AI is temporarily disabled. Please try again shortly.",
  guestLimitReached: `Daily limit reached for this device. Sign up free for ${LIMITS.freeDailyCredits} more per day.`,
} as const;

export const COPY = {
  freeDailyShort: `${LIMITS.freeDailyCredits}`,
  proDailyShort: `${LIMITS.proDailyCredits}`,
  freeDailyLong: `${LIMITS.freeDailyCredits} analyses per day`,
  proDailyLong: `Unlimited analyses (${LIMITS.proDailyCredits}/day)`,
  freeDailyCompact: `${LIMITS.freeDailyCredits} analyses/day`,
  proDailyCompact: `${LIMITS.proDailyCredits} analyses/day`,
  proDailyFeature: `${LIMITS.proDailyCredits} analyses per day`,
  comparisonFree: `${LIMITS.freeDailyCredits}`,
  comparisonPro: `Unlimited (${LIMITS.proDailyCredits}/day)`,
} as const;
