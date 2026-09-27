import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { ReadinessDto } from "./dto/readiness.dto";

@Injectable()
export class ReadinessService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
  ) {}

  async score(dto: ReadinessDto, userId?: string) {
    if (userId) {
      await this.usage.check(userId);
    }
    const input = {
      title: dto.title.trim(),
      description: (dto.description || "").trim(),
      hook: (dto.hook || "").trim(),
      thumbnail: (dto.thumbnail || "").trim(),
    };

    const result = await this.callLLM(input);

    if (userId) {
      await this.usage.increment(userId);
      await this.prisma.readinessScore.create({
        data: { userId, input, analysis: result },
      });
    }

    return result;
  }

  private async callLLM(input: { title: string; description: string; hook: string; thumbnail: string }): Promise<any> {
    const prompt = `You are a YouTube video quality analyst. Evaluate this video's upload readiness based on its title, description, hook, and thumbnail description.

Score each component 0-100:
1. Title score — clickability, pattern usage, power words, length
2. Description score — SEO, structure, hook, CTA, hashtags
3. Hook score — attention-grabbing, clarity, pacing
4. Thumbnail score — text readability, contrast, emotion, focus
5. Overall score (average of above)

Then identify:
6. Weakest area — which component needs the most improvement?
7. Strongest area — which component is already strong?
8. Recommendation — 2-3 sentences on what to improve
9. Final advice — 1-2 sentences of publish-ready guidance

Also provide:
10. Go/No-Go recommendation — should they publish now or wait?
11. Improvement checklist — 3-5 specific actionable items ordered by impact

Respond ONLY with valid JSON:
{
  "overallScore": number,
  "titleScore": number,
  "descriptionScore": number,
  "hookScore": number,
  "thumbnailScore": number,
  "weakestArea": "string",
  "strongestArea": "string",
  "recommendation": "2-3 sentences",
  "finalAdvice": "1-2 sentences",
  "goNoGo": "go" | "no-go",
  "improvementChecklist": ["item1", "item2", "item3"]
}

Title: "${input.title}"
Description: "${input.description}"
Hook: "${input.hook}"
Thumbnail: "${input.thumbnail}"`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }
}
