import { POWER_WORDS } from "./power-words";

export interface TitleMetrics {
  characterCount: number;
  wordCount: number;
  hasNumber: boolean;
  hasQuestionMark: boolean;
  hasColon: boolean;
  hasExclamation: boolean;
  isComparison: boolean;
  isListicle: boolean;
  startsWithHowTo: boolean;
  startsWithQuestion: boolean;
  startsWithNumber: boolean;
  capitalRatio: number;
  lengthFlag: "short" | "medium" | "long";
}

export interface PreAnalysisResult {
  characterCount: number;
  wordCount: number;
  hasNumber: boolean;
  hasQuestionMark: boolean;
  hasColon: boolean;
  hasExclamation: boolean;
  isComparison: boolean;
  isListicle: boolean;
  startsWithHowTo: boolean;
  startsWithQuestion: boolean;
  startsWithNumber: boolean;
  capitalRatio: number;
  lengthFlag: "short" | "medium" | "long";
  powerWords: string[];
  detectedPatterns: string[];
  readabilityScore: number;
  computedViralityScore: number;
}

export function computeRealMetrics(title: string): TitleMetrics {
  const charCount = title.length;
  const words = title.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const hasNumber = /\d/.test(title);
  const hasQuestionMark = title.includes("?");
  const hasColon = title.includes(":");
  const hasExclamation = title.includes("!");
  const isComparison = /\bvs?\b/i.test(title) || title.includes(" vs ") || title.includes(" VS ") || title.includes(" versus ");
  const isListicle = hasNumber && wordCount >= 4;
  const startsWithHowTo = /^how\s+to/i.test(title);
  const startsWithQuestion = /^(what|why|when|where|who|how|did|do|does|is|are|can|could|will|would|should)/i.test(title.split(" ")[0] || "");
  const startsWithNumber = /^\d+/.test(title);
  const capLetters = title.replace(/[^A-Z]/g, "").length;
  const capitalRatio = charCount > 0 ? capLetters / charCount : 0;
  let lengthFlag: "short" | "medium" | "long";
  if (charCount <= 30) lengthFlag = "short";
  else if (charCount <= 60) lengthFlag = "medium";
  else lengthFlag = "long";

  return { characterCount: charCount, wordCount, hasNumber, hasQuestionMark, hasColon, hasExclamation, isComparison, isListicle, startsWithHowTo, startsWithQuestion, startsWithNumber, capitalRatio, lengthFlag };
}

export function detectPowerWords(title: string): string[] {
  const lower = title.toLowerCase();
  return POWER_WORDS.filter((pw) => {
    const idx = lower.indexOf(pw.toLowerCase());
    if (idx === -1) return false;
    const before = lower[idx - 1] || " ";
    const after = lower[idx + pw.length] || " ";
    return !before.match(/[a-z]/) && !after.match(/[a-z]/);
  });
}

export function detectPatterns(title: string, metrics: TitleMetrics): string[] {
  const patterns: string[] = [];
  if (metrics.startsWithHowTo) patterns.push("How-To");
  if (metrics.isListicle) patterns.push("Number/Listicle");
  if (metrics.isComparison) patterns.push("Comparison");
  if (metrics.startsWithQuestion || metrics.hasQuestionMark) patterns.push("Question");
  if (metrics.hasColon) patterns.push("Colon/Specificity");
  if (metrics.hasExclamation) patterns.push("Exclamation/Urgency");
  if (title.toLowerCase().includes(" you ")) patterns.push("Direct Address");
  const brackets = (title.match(/[\[\(\{]/g) || []).length;
  if (brackets >= 1) patterns.push("Bracket/Format");
  if (title.toLowerCase().includes("to ")) patterns.push("Transformational");
  const contrastWords = /\b(but|however|instead|without|unlike)\b/i;
  if (contrastWords.test(title)) patterns.push("Contrast");
  if (metrics.wordCount <= 4) patterns.push("Ultra-Short");
  if (metrics.characterCount >= 70) patterns.push("Long-Form");
  return patterns;
}

export function computeReadability(title: string): number {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgSyllablesPerWord = totalSyllables / words.length;
  let score = 100;
  if (avgSyllablesPerWord > 1.8) score -= (avgSyllablesPerWord - 1.8) * 30;
  if (title.length > 80) score -= (title.length - 80) * 0.5;
  if (title.length < 20) score -= (20 - title.length) * 1.5;
  if (title.includes("?")) score += 5;
  if (title.includes("!")) score += 3;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  let count = 0;
  let prevVowel = false;
  for (const ch of w) {
    const isVowel = "aeiou".includes(ch);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith("e")) count = Math.max(1, count - 1);
  if (w.endsWith("le") && w.length > 2 && !"aeiou".includes(w[w.length - 3])) count = Math.max(1, count + 1);
  return Math.max(1, count);
}

export function computeViralityScore(
  metrics: TitleMetrics,
  powerWords: string[],
  patterns: string[],
  readabilityScore: number
): number {
  let score = 50;
  if (metrics.hasNumber) score += 10;
  if (metrics.hasQuestionMark) score += 8;
  if (metrics.startsWithHowTo) score += 7;
  if (metrics.isComparison) score += 8;
  if (metrics.isListicle) score += 6;
  if (metrics.hasColon) score += 5;
  if (metrics.hasExclamation) score += 4;
  if (metrics.startsWithQuestion) score += 5;
  const patternBonus = patterns.length * 4;
  score += Math.min(patternBonus, 16);
  const powerWordBonus = powerWords.length * 3;
  score += Math.min(powerWordBonus, 21);
  if (metrics.lengthFlag === "medium") score += 8;
  else if (metrics.lengthFlag === "short") score += 3;
  else score -= 5;
  const readabilityContribution = Math.round((readabilityScore - 50) / 5);
  score += readabilityContribution;
  if (metrics.capitalRatio > 0.3) score -= 5;
  if (metrics.characterCount > 100) score -= 8;
  if (metrics.characterCount < 15) score -= 5;
  const directAddressBonus = patterns.includes("Direct Address") ? 3 : 0;
  score += directAddressBonus;
  if (powerWords.length >= 3) score += 3;
  if (powerWords.length >= 5) score += 2;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function runPreAnalysis(title: string): PreAnalysisResult {
  const metrics = computeRealMetrics(title);
  const powerWords = detectPowerWords(title);
  const detectedPatterns = detectPatterns(title, metrics);
  const readabilityScore = computeReadability(title);
  const computedViralityScore = computeViralityScore(metrics, powerWords, detectedPatterns, readabilityScore);
  return { ...metrics, powerWords, detectedPatterns, readabilityScore, computedViralityScore };
}

export function getWeakestDimension(psychology: Record<string, number>): { name: string; score: number } {
  let minName = "curiosity";
  let minScore = Infinity;
  for (const [key, val] of Object.entries(psychology)) {
    if (val < minScore) { minScore = val; minName = key; }
  }
  return { name: minName, score: minScore };
}

export function generateNextAction(
  weakestDimension: string,
  powerWords: string[],
  engineScore: number,
  llmScore: number,
  patterns: string[]
): string {
  const suggestions: Record<string, string[]> = {
    curiosity: ["Add a curiosity gap by hinting at something unexpected.", "Try framing the title as a question."],
    authority: ["Include a statistic, study, or expert reference.", "Use authoritative power words like 'Proven' or 'Scientific'."],
    novelty: ["Add words like 'New', 'Updated', or '2024' to signal freshness.", "Promise a new perspective or approach."],
    emotion: ["Add an emotional power word like 'Love', 'Hate', or 'Heartbreaking'.", "Connect the title to a relatable feeling."],
    conflict: ["Introduce a contrast like 'X vs Y' or 'Without X'.", "Challenge a common belief or assumption."],
    specificity: ["Add a specific number, year, or concrete detail.", "Be more precise about the outcome or timeframe."],
    urgency: ["Add time-sensitive words like 'Now', 'Today', or 'Limited'.", "Create fear of missing out (FOMO)."],
  };
  const dimSuggestions = suggestions[weakestDimension] || ["Try a different pattern or angle."];
  const suggestion = dimSuggestions[Math.floor(Math.random() * dimSuggestions.length)];
  return suggestion;
}
