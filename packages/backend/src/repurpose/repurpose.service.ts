import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { RepurposeDto } from "./dto/repurpose.dto";

@Injectable()
export class RepurposeService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
  ) {}

  async repurpose(dto: RepurposeDto, userId?: string) {
    const title = dto.title.trim();
    const niche = dto.niche?.trim() || "general";

    if (userId) {
      await this.usage.check(userId);
    }

    const result = await this.callLLM(title, niche);

    if (userId) {
      await this.usage.increment(userId);
      await this.prisma.repurpose.create({
        data: { userId, title, niche, analysis: result },
      });
    }

    return result;
  }

  private async callLLM(title: string, niche: string): Promise<any> {
    const prompt = `You are a viral content strategist who specializes in cross-platform repurposing. Given a YouTube video title and its niche, adapt it for 4 other platforms.

For each platform, create:
1. An adapted title/headline optimized for that platform's style
2. A short caption or post body (appropriate length for the platform)
3. 3-5 relevant hashtags
4. 1-2 tips for posting on that platform
5. A viral potential index (0-100) — how likely this content is to perform well on this specific platform
6. Best posting time suggestion

Platforms and their styles:
- **TikTok**: Short, punchy, trend-aware, hook in first 2 seconds. Caption: 1-3 lines max. High energy.
- **Instagram**: Visual-first, storytelling, emotional hook. Caption: 2-4 sentences with line breaks.
- **X (Twitter)**: Ultra-concise, strong opinion or insight. Caption: under 280 chars.
- **LinkedIn**: Professional, value-driven, educational. Caption: 3-6 sentences, story + lesson format.

Sort the platforms by viral potential (highest first).

Respond ONLY with valid JSON:
{
  "originalTitle": "${title}",
  "posts": [
    {
      "platform": "TikTok",
      "icon": "music",
      "title": "Adapted TikTok title",
      "caption": "Short punchy caption",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
      "tips": ["Tip 1", "Tip 2"],
      "viralPotentialIndex": number,
      "bestPostingTime": "Suggested time"
    },
    {
      "platform": "Instagram",
      "icon": "camera",
      "title": "Adapted Instagram headline",
      "caption": "Engaging caption with line breaks",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "tips": ["Tip 1", "Tip 2"],
      "viralPotentialIndex": number,
      "bestPostingTime": "Suggested time"
    },
    {
      "platform": "X (Twitter)",
      "icon": "message-circle",
      "title": "Adapted X headline",
      "caption": "Concise post under 280 chars",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "tips": ["Tip 1", "Tip 2"],
      "viralPotentialIndex": number,
      "bestPostingTime": "Suggested time"
    },
    {
      "platform": "LinkedIn",
      "icon": "briefcase",
      "title": "Adapted LinkedIn headline",
      "caption": "Professional value-driven post",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
      "tips": ["Tip 1", "Tip 2"],
      "viralPotentialIndex": number,
      "bestPostingTime": "Suggested time"
    }
  ]
}

Original YouTube Title: "${title}"
Niche: "${niche}"`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }
}
