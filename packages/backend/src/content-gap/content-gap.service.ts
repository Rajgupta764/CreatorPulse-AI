import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { ContentGapDto } from "./dto/content-gap.dto";

@Injectable()
export class ContentGapService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
  ) {}

  async findGaps(dto: ContentGapDto, userId?: string) {
    if (userId) {
      await this.usage.checkAndIncrement(userId);
    }
    const urls = (dto.urls || "").trim();
    const topics = (dto.topics || "").trim();

    let niche: string | undefined;
    if (userId) {
      const lastGen = await this.prisma.generation.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (lastGen?.niche) niche = lastGen.niche;
    }

    const result = await this.callLLM(urls, topics, niche);

    if (userId) {
      await this.prisma.contentGap.create({
        data: {
          userId,
          inputUrls: urls || null,
          inputTopics: topics || null,
          analysis: result,
        },
      });
    }

    return result;
  }

  private async callLLM(urls: string, topics: string, niche?: string): Promise<any> {
    const prompt = `You are a YouTube content strategist specializing in competitive analysis. Analyze the following competitor content and identify content gaps and opportunities.

The user's niche: ${niche || "general"}
The user has provided descriptions of what competitors in their niche are covering:

${urls ? `Competitor content:\n${urls}` : ""}
${topics ? `Their niche/topics:\n${topics}` : ""}

Analyze and identify:
1. Everyone covers — topics that ALL competitors seem to be making videos about (saturated)
2. Nobody covers — topics that NONE of the competitors are covering (gaps)
3. Opportunities — specific content opportunities with:
   - The opportunity description
   - Rationale explaining why they'd work
   - Opportunity score (0-100)
   - Difficulty level (easy/medium/hard)
   - Timeline suggestion (this week / this month / this quarter)
   - First mover advantage flag (true/false)
4. Content gap — 1-2 sentence summary of the main content gap
5. Recommendation — what the creator should make next, with reasoning

Respond ONLY with valid JSON:
{
  "everyoneCovers": ["Saturated topic 1", "Saturated topic 2"],
  "nobodyCovers": ["Gap topic 1", "Gap topic 2"],
  "opportunities": [
    {
      "opportunity": "Content opportunity",
      "rationale": "Why this is a good opportunity",
      "opportunityScore": number,
      "difficulty": "easy" | "medium" | "hard",
      "timeline": "this week" | "this month" | "this quarter",
      "firstMoverAdvantage": boolean
    }
  ],
  "contentGap": "1-2 sentence summary of the main gap",
  "recommendation": "What to make next and why"
}`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }
}
