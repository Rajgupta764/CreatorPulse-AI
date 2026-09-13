import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { ValidateDto } from "./dto/validate.dto";

@Injectable()
export class ValidateService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
  ) {}

  async validate(dto: ValidateDto, userId?: string) {
    const idea = dto.idea.trim();
    const niche = dto.niche?.trim();

    if (userId) {
      await this.usage.checkAndIncrement(userId);
    }

    const result = await this.callLLM(idea, niche);

    if (userId) {
      await this.prisma.validation.create({
        data: { userId, idea, niche: niche || null, analysis: result },
      });
    }

    return result;
  }

  private async callLLM(idea: string, niche?: string): Promise<any> {
    const nicheContext = niche ? `The creator's niche is: "${niche}".` : "";
    const prompt = `You are a YouTube content strategist and data analyst. Evaluate this video idea and determine whether the creator should invest time in it.

${nicheContext}
Analyze these dimensions (score each 0-100):
1. Competition — how saturated is this topic? (low score = saturated, high score = unique angle available)
2. Demand — how much search interest / audience demand exists?
3. Virality — does this idea have viral potential (shareability, controversy, curiosity)?
4. Difficulty — how hard is it to execute well (research, production, expertise)?
5. Content Gap — is there an angle or perspective that isn't being covered?
6. Opportunity — overall opportunity score combining all factors
7. Overall score (0-100)
8. A clear recommendation — should they make this video? Why or why not?

If the overall score is below 70, suggest an EVOLVED version of the idea that would score higher (include estimated new score).

Respond ONLY with valid JSON:
{
  "competition": { "score": number, "explanation": "1 sentence" },
  "demand": { "score": number, "explanation": "1 sentence" },
  "virality": { "score": number, "explanation": "1 sentence" },
  "difficulty": { "score": number, "explanation": "1 sentence" },
  "contentGap": { "score": number, "explanation": "1 sentence" },
  "opportunity": { "score": number, "explanation": "1 sentence" },
  "overallScore": number,
  "recommendation": "2-3 sentence recommendation explaining whether to proceed",
  "evolution": {
    "evolvedIdea": "Improved version of the idea",
    "estimatedNewScore": number,
    "explanation": "Why this evolved version would score higher"
  }
}

Idea: "${idea}"`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }
}
