import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { CommentsDto } from "./dto/comments.dto";

@Injectable()
export class CommentsService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
  ) {}

  async analyze(dto: CommentsDto, userId?: string) {
    if (userId) {
      await this.usage.checkAndIncrement(userId);
    }
    const comments = dto.comments.trim();
    let niche = dto.niche?.trim();
    let recentTitles: string[] = [];

    if (userId) {
      const lastGen = await this.prisma.generation.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (lastGen?.niche && !niche) niche = lastGen.niche;

      const recent = await this.prisma.generation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { inputTitle: true },
      });
      recentTitles = recent.map((r) => r.inputTitle);
    }

    const result = await this.callLLM(comments, niche || "general", recentTitles);

    if (userId) {
      await this.prisma.commentAnalysis.create({
        data: { userId, inputComments: comments, analysis: result },
      });
    }

    return {
      ...result,
      _context: { niche: niche || "general", recentTitles: recentTitles.slice(0, 3) },
    };
  }

  private async callLLM(comments: string, niche: string, recentTitles: string[]): Promise<any> {
    const nicheContext = niche ? `The creator's niche is: "${niche}".` : "";
    const titlesContext = recentTitles.length
      ? `They have recently published videos titled: ${recentTitles.join(", ")}.`
      : "";

    const prompt = `You are a YouTube audience intelligence analyst. Analyze the following YouTube comments and extract actionable insights for the creator.

${nicheContext}
${titlesContext}
Identify:
1. Summary — 2-3 sentence overview of what viewers are saying
2. Requested topics — specific topics viewers are asking to see (with frequency: "common", "several", "few")
3. Questions — questions viewers are asking that the video didn't answer
4. Confusion — things viewers found confusing or unclear
5. Pain points — problems or frustrations viewers express
6. Future video ideas — specific video ideas suggested or implied by comments. Rank each by Subscriber Potential Score (0-100) — a score of 80+ means "make this immediately"
7. Sentiment — overall sentiment (positive, mixed, negative, or constructive)
8. Audience profile — 1-2 sentence summary of what this audience values
9. Content gap alerts — topics mentioned in comments that the creator might not have covered

Respond ONLY with valid JSON:
{
  "summary": "2-3 sentence summary",
  "requestedTopics": [
    { "topic": "Topic name", "frequency": "common" }
  ],
  "questions": [
    { "question": "Question text", "context": "Why they're asking" }
  ],
  "confusion": ["Point of confusion 1"],
  "painPoints": ["Pain point 1"],
  "videoIdeas": [
    { "idea": "Video idea", "reason": "Why this would perform well", "subscriberPotentialScore": number }
  ],
  "sentiment": "overall sentiment",
  "audienceProfile": "1-2 sentence summary of audience values",
  "contentGapAlerts": ["Topic 1", "Topic 2"]
}

Comments:
"""
${comments}
"""`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }
}
