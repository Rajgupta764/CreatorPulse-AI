export interface GateResult {
  ok: boolean;
  reason?: string;
}

export const GATE_RULES = {
  title: {
    minWords: 2,
    emptyReason: "That doesn't look like a real title — give us a few more words to work with.",
  },
  idea: {
    minWords: 4,
    emptyReason: "That doesn't look like a real video idea — describe it in a few more words.",
  },
} as const;

const MIN_VOWEL_RATIO = 0.15;
const MAX_SYMBOL_RATIO = 0.4;
const MIN_LETTERS_FOR_PATTERN_CHECKS = 8;
const MIN_LATIN_SHARE = 0.6;
const MIN_SUBSTANTIAL_WORD_LENGTH = 3;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function vowelRatio(text: string): number {
  const letters = text.toLowerCase().replace(/[^a-z]/g, "");
  if (!letters.length) return 0;
  const vowels = (letters.match(/[aeiou]/g) || []).length;
  return vowels / letters.length;
}

export function nonAlphanumericRatio(text: string): number {
  const chars = text.replace(/\s/g, "");
  if (!chars.length) return 1;
  const symbols = chars.replace(/[a-z0-9]/gi, "").length;
  return symbols / chars.length;
}

function latinShare(text: string): number {
  const chars = text.replace(/\s/g, "");
  if (!chars.length) return 0;
  const letters = chars.replace(/[^a-zA-Z]/g, "").length;
  return letters / chars.length;
}

function hasSubstantialWord(text: string): boolean {
  return text
    .split(/\s+/)
    .some((word) => (word.match(/\p{L}/gu) || []).length >= MIN_SUBSTANTIAL_WORD_LENGTH);
}

export function assessText(
  text: string,
  rule: { minWords: number; emptyReason: string }
): GateResult {
  const trimmed = text.trim();

  if (countWords(trimmed) < rule.minWords) {
    return { ok: false, reason: rule.emptyReason };
  }

  if (!hasSubstantialWord(trimmed)) {
    return {
      ok: false,
      reason: "That doesn't look like it contains real words — write something we can score.",
    };
  }

  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  const isLatinDominant =
    letters.length >= MIN_LETTERS_FOR_PATTERN_CHECKS &&
    latinShare(trimmed) >= MIN_LATIN_SHARE;

  if (isLatinDominant && vowelRatio(trimmed) < MIN_VOWEL_RATIO) {
    return {
      ok: false,
      reason: "That looks like random keystrokes — write something meaningful and we'll score it.",
    };
  }

  if (isLatinDominant && nonAlphanumericRatio(trimmed) > MAX_SYMBOL_RATIO) {
    return {
      ok: false,
      reason: "That's a lot of symbols — write it the way you'd say it out loud.",
    };
  }

  return { ok: true };
}

export function assessTitle(title: string): GateResult {
  return assessText(title, GATE_RULES.title);
}

export function assessIdea(idea: string): GateResult {
  return assessText(idea, GATE_RULES.idea);
}
