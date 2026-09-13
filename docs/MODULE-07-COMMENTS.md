# Module 07 — Comments (Audience Compass)

> **Goal:** Analyze pasted YouTube comments to extract audience profile, requested topics, video ideas (ranked by subscriber potential), content gap alerts, and sentiment.

---

## Files to Create

```
packages/backend/src/comments/
├── comments.module.ts
├── comments.controller.ts
├── comments.service.ts
└── dto/
    └── comments.dto.ts
```

---

## DTO

### `comments/dto/comments.dto.ts`

```typescript
import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CommentsDto {
  @ApiProperty({ example: "Great video! Could you make a tutorial on..." })
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  comments: string;

  @ApiProperty({ example: "tech", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  niche?: string;
}
```

---

## Comments Service

### `comments/comments.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { CommentsDto } from "./dto/comments.dto";

@Injectable()
export class CommentsService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService
  ) {}

  async analyze(dto: CommentsDto, userId?: string) {
    const comments = dto.comments.trim();
    let niche = dto.niche?.trim();
    let recentTitles: string[] = [];

    // Fetch user context if authenticated
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
```

---

## Comments Controller

### `comments/comments.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CommentsService } from "./comments.service";
import { CommentsDto } from "./dto/comments.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Comments")
@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async analyze(
    @Body() dto: CommentsDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.commentsService.analyze(dto, user?.id);
  }
}
```

---

## Comments Module

```typescript
import { Module } from "@nestjs/common";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
```

---

## API Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/comments` | Optional (JWT) | Analyze YouTube comments |

### Response
```json
{
  "summary": "Viewers are asking for more intermediate-level tutorials",
  "requestedTopics": [
    { "topic": "Keyboard shortcuts", "frequency": "common" },
    { "topic": "Color grading", "frequency": "several" }
  ],
  "questions": [
    { "question": "How do you export in 4K?", "context": "They're stuck on export settings" }
  ],
  "confusion": ["The timeline section was too fast"],
  "painPoints": ["Editing takes too long", "Can't find good transitions"],
  "videoIdeas": [
    { "idea": "10 Keyboard Shortcuts to Edit 2x Faster", "reason": "Multiple commenters requested shortcuts", "subscriberPotentialScore": 92 }
  ],
  "sentiment": "positive",
  "audienceProfile": "Intermediate editors who want to speed up their workflow",
  "contentGapAlerts": ["You haven't covered keyboard shortcuts yet"],
  "_context": { "niche": "tech", "recentTitles": ["How to edit faster"] }
}
```

---

## Acceptance Criteria

- [ ] `POST /api/comments` returns all analysis fields
- [ ] Video ideas have `subscriberPotentialScore` (0-100)
- [ ] `contentGapAlerts` flags topics not covered by creator
- [ ] `audienceProfile` is a concise 1-2 sentence summary
- [ ] Authenticated users have analysis saved to DB
- [ ] User context (niche, recent titles) is fetched automatically
- [ ] Frontend comments page works via proxy
