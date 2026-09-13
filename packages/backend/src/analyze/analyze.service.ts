import { Injectable, Logger } from "@nestjs/common";
import { runPreAnalysis, getWeakestDimension, generateNextAction } from "../common/engine";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { AnalyzeDto } from "./dto/analyze.dto";

@Injectable()
export class AnalyzeService {
  private readonly logger = new Logger(AnalyzeService.name);

  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
  ) {}

  async analyze(dto: AnalyzeDto, userId?: string) {
    const title = dto.title.trim();
    const niche = dto.niche?.trim() || "general";

    if (userId) {
      await this.usage.checkAndIncrement(userId);
    }

    const preAnalysis = runPreAnalysis(title);

    let userContext = null;
    if (userId) {
      userContext = await this.getUserContext(userId);
    }

    const analysis = await this.callLLM(title, preAnalysis, niche);

    analysis.characterCount = preAnalysis.characterCount;
    analysis.readabilityScore = preAnalysis.readabilityScore;
    analysis.patterns = preAnalysis.detectedPatterns;
    analysis.powerWords = preAnalysis.powerWords;
    analysis.viralityScore = preAnalysis.computedViralityScore;
    analysis.computedViralityScore = preAnalysis.computedViralityScore;

    if (analysis.psychology) {
      const weakest = getWeakestDimension(analysis.psychology);
      analysis.nextAction = generateNextAction(
        weakest.name,
        analysis.powerWords,
        preAnalysis.computedViralityScore,
        analysis.viralityScore,
        analysis.patterns
      );
    }

    if (userContext) {
      analysis.userContext = userContext;
    }

    const [titlesResult, descResult] = await Promise.allSettled([
      this.generateTitles(title, preAnalysis, niche),
      this.generateDescription(title, niche),
    ]);

    const titles = titlesResult.status === "fulfilled" ? titlesResult.value : [];
    const description = descResult.status === "fulfilled"
      ? descResult.value
      : { description: "", chapters: [], hashtags: [] };

    if (userId) {
      await this.saveToDb(userId, title, niche, analysis, titles, description);
    }

    return { analysis, titles, description };
  }

  private async callLLM(title: string, pre: any, niche: string): Promise<any> {
    const prompt = `You are a viral YouTube content strategist and psychologist. Analyze the following YouTube video title.

Here are the REAL metrics computed from this title:
- Character count: ${pre.characterCount}
- Word count: ${pre.wordCount}
- Contains number: ${pre.hasNumber}
- Contains question mark: ${pre.hasQuestionMark}
- Contains colon: ${pre.hasColon}
- Is comparison (X vs Y): ${pre.isComparison}
- Is listicle/number format: ${pre.isListicle}
- Starts with "How to": ${pre.startsWithHowTo}
- Starts with a question word: ${pre.startsWithQuestion}
- Viral patterns detected: ${pre.detectedPatterns.join(", ") || "none"}
- Power words found: ${pre.powerWords.join(", ") || "none"}
- Readability score: ${pre.readabilityScore}/100
- Computed virality score (from real metrics): ${pre.computedViralityScore}/100

Based on this REAL DATA, provide a deeper psychological and strategic analysis:

1. Emotional triggers — which emotions does this title evoke? (choose from: fear, greed, curiosity, outrage, aspiration, surprise, humor, nostalgia, inspiration)
2. Hook type — what kind of hook does this use? (question, bold statement, number, curiosity gap, how-to, comparison, controversy, transformation)
3. Psychology scores (0-100) for each dimension:
   - Curiosity: does it create an information gap?
   - Authority: does it position the creator as an expert?
   - Novelty: does it promise something new or unexpected?
   - Emotion: does it evoke a strong emotional response?
   - Conflict: does it present tension or opposition?
   - Specificity: does it use precise numbers, names, or details?
   - Urgency: does it make the viewer feel they need to watch now?
4. Target audience — describe the ideal viewer this title appeals to (2-3 sentences)
5. CTR explanation — 2-3 sentences explaining exactly WHY this title earns clicks, incorporating the real metrics above
6. Why it works — holistic explanation incorporating the real metrics (2-3 sentences)

Base your analysis on the provided real data. Do NOT contradict it. Do NOT re-list the patterns, power words, or character count — they are already shown to the user.

Respond ONLY with valid JSON:
{
  "emotionalTriggers": string[],
  "hookType": string,
  "psychology": {
    "curiosity": number,
    "authority": number,
    "novelty": number,
    "emotion": number,
    "conflict": number,
    "specificity": number,
    "urgency": number
  },
  "targetAudience": string,
  "ctrExplanation": string,
  "whyItWorks": string
}

Title: "${title}"`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }

  private async generateTitles(title: string, pre: any, niche: string): Promise<any[]> {
    const prompt = `You are a viral YouTube content strategist. Given a winning video title and a target niche, generate 5 structurally similar titles.

The original title has these real characteristics:
- Pattern structure: ${pre.detectedPatterns.join(", ")}
- Character count range: ${pre.characterCount} chars
- It uses power words like: ${pre.powerWords.join(", ") || "none"}
- Length flag: ${pre.lengthFlag}

For each generated title:
1. Preserve the SAME viral pattern structure as the original
2. Match the character length (aim for ${Math.max(20, pre.characterCount - 10)}-${pre.characterCount + 10} chars)
3. Be optimized for the "${niche}" niche
4. Include power words similar to the original when possible
5. Explain why this specific title would perform well in the target niche

Respond ONLY with valid JSON:
{
  "titles": [
    {
      "title": "Generated title",
      "pattern": "Which viral pattern this uses",
      "whyWorks": "Brief 1-sentence explanation why this would perform well in ${niche}"
    }
  ]
}

Original title: "${title}"
Target niche: "${niche}"`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json).titles || [];
  }

  async generateAlternatives(title: string, suggestion: string): Promise<string[]> {
    const prompt = `You are a viral YouTube title strategist. Given a title and a specific suggestion for improvement, generate 3 alternative titles that apply the suggestion.

Suggestion: "${suggestion}"
Original title: "${title}"

Rules:
- Each alternative must directly apply the suggestion.
- Keep the same length range (20-80 chars).
- Make each alternative meaningfully different in approach.
- Briefly explain how each applies the suggestion.

Respond ONLY with valid JSON:
{
  "alternatives": [
    { "title": "Alternative title 1", "explanation": "How this applies the suggestion (1 sentence)" },
    { "title": "Alternative title 2", "explanation": "How this applies the suggestion (1 sentence)" },
    { "title": "Alternative title 3", "explanation": "How this applies the suggestion (1 sentence)" }
  ]
}`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    const parsed = this.groq.safeParse(json);
    return parsed.alternatives || [];
  }

  private async generateDescription(title: string, niche: string): Promise<any> {
    const prompt = `You are a viral YouTube content strategist. Write a YouTube video description for a video titled "${title}" in the "${niche}" niche.

Structure:
1. Hook paragraph (2-3 sentences) - grab attention, tease the transformation or result
2. Value body (3-4 sentences) - what the viewer will learn, key takeaways
3. Chapter markers (4-6 timestamps with labels)
4. Call to action (like, subscribe, comment)
5. 5-8 relevant hashtags

Tone: Energetic, confident, conversational. Use power words. Keep paragraphs short.

IMPORTANT: The "description" field must be a single-line string without actual line breaks. Use \\n escape sequences for line breaks instead of real newlines.

Respond ONLY with valid JSON:
{
  "description": "string with \\n for line breaks",
  "chapters": [{"time": "0:00", "label": "Hook"}],
  "hashtags": ["#viral", "#niche"]
}`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }

  private async getUserContext(userId: string) {
    const generations = await this.prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (generations.length === 0) {
      return {
        personalAverageVirality: null,
        personalBestVirality: null,
        mostUsedPattern: null,
        bestPerformingPattern: null,
        totalAnalyses: 0,
      };
    }

    let totalScore = 0;
    let bestScore = 0;
    const patternScores: Record<string, { total: number; count: number }> = {};

    for (const gen of generations) {
      const a = gen.analysis as any;
      const score = a.viralityScore ?? 0;
      totalScore += score;
      if (score > bestScore) bestScore = score;

      const patterns: string[] = a.patterns ?? [];
      for (const p of patterns) {
        if (!patternScores[p]) patternScores[p] = { total: 0, count: 0 };
        patternScores[p].total += score;
        patternScores[p].count += 1;
      }
    }

    let mostUsedPattern: string | null = null;
    let bestPerformingPattern: string | null = null;
    let mostUsedCount = 0;
    let bestAvg = 0;

    for (const [pattern, stats] of Object.entries(patternScores)) {
      if (stats.count > mostUsedCount) {
        mostUsedCount = stats.count;
        mostUsedPattern = pattern;
      }
      const avg = stats.total / stats.count;
      if (avg > bestAvg && stats.count >= 2) {
        bestAvg = avg;
        bestPerformingPattern = pattern;
      }
    }

    return {
      personalAverageVirality: Math.round(totalScore / generations.length),
      personalBestVirality: bestScore,
      mostUsedPattern,
      bestPerformingPattern,
      totalAnalyses: generations.length,
    };
  }

  private async saveToDb(userId: string, title: string, niche: string, analysis: any, titles: any[], description: any) {
    await this.prisma.generation.create({
      data: {
        userId,
        inputTitle: title,
        niche,
        analysis,
        generatedTitles: titles,
        generatedDescription: description,
      },
    });
  }

}
