# Module 08 — Content-Gap (Opportunity Map)

> **Goal:** Analyze competitor content to find saturated topics vs untapped opportunities, with difficulty/timeline ratings and first-mover advantage flags.

---

## Files to Create

```
packages/backend/src/content-gap/
├── content-gap.module.ts
├── content-gap.controller.ts
├── content-gap.service.ts
└── dto/
    └── content-gap.dto.ts
```

---

## DTO

### `content-gap/dto/content-gap.dto.ts`

```typescript
import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ContentGapDto {
  @ApiProperty({ example: "https://youtube.com/@competitor", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  urls?: string;

  @ApiProperty({ example: "video editing tutorials, color grading", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  topics?: string;
}
```

---

## Content-Gap Service

### `content-gap/content-gap.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { ContentGapDto } from "./dto/content-gap.dto";

@Injectable()
export class ContentGapService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService
  ) {}

  async findGaps(dto: ContentGapDto, userId?: string) {
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
```

---

## Content-Gap Controller

```typescript
import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ContentGapService } from "./content-gap.service";
import { ContentGapDto } from "./dto/content-gap.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Content-Gap")
@Controller("content-gap")
export class ContentGapController {
  constructor(private readonly contentGapService: ContentGapService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findGaps(
    @Body() dto: ContentGapDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.contentGapService.findGaps(dto, user?.id);
  }
}
```

---

## Content-Gap Module

```typescript
import { Module } from "@nestjs/common";
import { ContentGapController } from "./content-gap.controller";
import { ContentGapService } from "./content-gap.service";

@Module({
  controllers: [ContentGapController],
  providers: [ContentGapService],
})
export class ContentGapModule {}
```

---

## API Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/content-gap` | Optional (JWT) | Find content gaps |

### Request
```json
{
  "urls": "https://youtube.com/@techcreator",
  "topics": "video editing, color grading, transitions"
}
```

### Response
```json
{
  "everyoneCovers": ["Color grading basics", "Top 10 transitions"],
  "nobodyCovers": ["Keyboard shortcuts for Premiere Pro", "Batch processing workflows"],
  "opportunities": [
    {
      "opportunity": "10 Keyboard Shortcuts That Will Cut Your Editing Time in Half",
      "rationale": "No major creator has covered this comprehensively",
      "opportunityScore": 88,
      "difficulty": "easy",
      "timeline": "this week",
      "firstMoverAdvantage": true
    }
  ],
  "contentGap": "Keyboard shortcuts and efficiency workflows are underserved",
  "recommendation": "Create a shortcuts video this week — it's easy and has first-mover advantage"
}
```

---

## Acceptance Criteria

- [ ] `POST /api/content-gap` returns saturated topics, gaps, and opportunities
- [ ] Each opportunity has score, difficulty, timeline, and first-mover flag
- [ ] Authenticated users have analysis saved to DB
- [ ] Frontend content-gap page works via proxy
