import { Injectable } from "@nestjs/common";
import { runPreAnalysis } from "../common/engine";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { BattleDto } from "./dto/battle.dto";

@Injectable()
export class BattleService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
  ) {}

  async battle(dto: BattleDto, userId?: string) {
    const titleA = dto.titleA.trim();
    const titleB = dto.titleB.trim();

    if (userId) {
      await this.usage.checkAndIncrement(userId);
    }

    const preA = runPreAnalysis(titleA);
    const preB = runPreAnalysis(titleB);

    const result = await this.callLLM(titleA, titleB, preA, preB);

    if (userId) {
      await this.prisma.battle.create({
        data: {
          userId,
          titleA,
          titleB,
          winnerTitle: result.winner.title,
          winnerScore: result.winner.score,
          loserScore: result.loser.score,
          analysis: result,
        },
      });
    }

    return { ...result, _preA: preA, _preB: preB };
  }

  private async callLLM(titleA: string, titleB: string, preA: any, preB: any): Promise<any> {
    const prompt = `You are a viral YouTube title strategist and data analyst. Compare these two YouTube video titles and determine which one would get a higher CTR (click-through rate).

REAL METRICS FOR BOTH TITLES:
Title A: "${titleA}"
- Character count: ${preA.characterCount}
- Word count: ${preA.wordCount}
- Patterns: ${preA.detectedPatterns.join(", ") || "none"}
- Power words: ${preA.powerWords.join(", ") || "none"}
- Computed virality score: ${preA.computedViralityScore}/100

Title B: "${titleB}"
- Character count: ${preB.characterCount}
- Word count: ${preB.wordCount}
- Patterns: ${preB.detectedPatterns.join(", ") || "none"}
- Power words: ${preB.powerWords.join(", ") || "none"}
- Computed virality score: ${preB.computedViralityScore}/100


For each title, analyze:
1. Final virality score (0-100) — consider both any real metrics provided AND psychological impact
2. Key strengths — what makes it clickable
3. Key weaknesses — what might reduce clicks
4. Score explanation — 1-2 sentences breaking down the key factors

Then declare a winner and explain in 2-3 sentences why it wins.

MOST IMPORTANTLY: Suggest a HYBRID title that combines the best elements of both titles into a single, stronger title.

Respond ONLY with valid JSON:
{
  "winner": {
    "title": "Winning title text",
    "score": number,
    "reason": "Why this title wins (1 sentence)",
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "scoreExplanation": "1-2 sentences explaining how this score was determined"
  },
  "loser": {
    "title": "Losing title text",
    "score": number,
    "reason": "Why this title falls short (1 sentence)",
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "scoreExplanation": "1-2 sentences explaining how this score was determined"
  },
  "summary": "2-3 sentence battle summary explaining the key deciding factors",
  "hybridTitle": {
    "title": "The hybrid title combining best elements of both",
    "explanation": "Why this hybrid would outperform both originals"
  }
}

Title A: "${titleA}"
Title B: "${titleB}"`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }
}
