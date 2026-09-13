import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { HookDto } from "./dto/hook.dto";

@Injectable()
export class HookService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
  ) {}

  async generate(dto: HookDto, userId?: string) {
    const title = dto.title.trim();
    const niche = dto.niche?.trim() || "general";

    if (userId) {
      await this.usage.checkAndIncrement(userId);
    }

    const result = await this.callLLM(title, niche);

    if (userId) {
      await this.prisma.hook.create({
        data: { userId, inputTitle: title, niche, analysis: result },
      });
    }

    return result;
  }

  private async callLLM(title: string, niche: string): Promise<any> {
    const prompt = `You are a viral YouTube content strategist and scriptwriter. Write 3 different 30-second opening hook scripts for a YouTube video, each in a different style.

Hook styles to generate:
1. Question hook — starts with a provocative question
2. Bold statement hook — starts with a strong, surprising claim
3. Storytelling hook — starts with a brief personal story or scenario

Each hook should:
- Be 60-90 words (roughly 30 seconds when spoken)
- Match the energy and tone appropriate for the "${niche}" niche
- End with a smooth transition into the main content

Respond ONLY with valid JSON:
{
  "hooks": [
    {
      "style": "question",
      "hook": "The full 30-second hook script text",
      "tone": "The tone/style of the hook",
      "deliveryTip": "One sentence on how to deliver this effectively on camera",
      "estimatedDuration": "~30 seconds"
    },
    {
      "style": "bold statement",
      "hook": "The full 30-second hook script text",
      "tone": "The tone/style of the hook",
      "deliveryTip": "One sentence on how to deliver this effectively on camera",
      "estimatedDuration": "~30 seconds"
    },
    {
      "style": "storytelling",
      "hook": "The full 30-second hook script text",
      "tone": "The tone/style of the hook",
      "deliveryTip": "One sentence on how to deliver this effectively on camera",
      "estimatedDuration": "~30 seconds"
    }
  ]
}

Video Title: "${title}"
Niche: "${niche}"`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }
}
