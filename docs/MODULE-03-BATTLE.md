# Module 03 — Battle (Title Fusion Lab)

> **Goal:** Compare two YouTube titles head-to-head with pre-analysis on both, LLM-powered scoring, hybrid title suggestion, and battle history tracking.

---

## Files to Create

```
packages/backend/src/battle/
├── battle.module.ts
├── battle.controller.ts
├── battle.service.ts
└── dto/
    └── battle.dto.ts
```

---

## DTO

### `battle/dto/battle.dto.ts`

```typescript
import { IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BattleDto {
  @ApiProperty({ example: "10 Ways to Grow Your YouTube Channel" })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  titleA: string;

  @ApiProperty({ example: "The Secret to Growing on YouTube in 2024" })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  titleB: string;
}
```

---

## Battle Service

### `battle/battle.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { runPreAnalysis } from "../common/engine";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { BattleDto } from "./dto/battle.dto";

@Injectable()
export class BattleService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService
  ) {}

  async battle(dto: BattleDto, userId?: string) {
    const titleA = dto.titleA.trim();
    const titleB = dto.titleB.trim();

    // Pre-analysis on both titles
    const preA = runPreAnalysis(titleA);
    const preB = runPreAnalysis(titleB);

    // LLM comparison
    const result = await this.callLLM(titleA, titleB, preA, preB);

    // Save battle result (if authenticated)
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
```

---

## Battle Controller

### `battle/battle.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { BattleService } from "./battle.service";
import { BattleDto } from "./dto/battle.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Battle")
@Controller("battle")
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async battle(
    @Body() dto: BattleDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.battleService.battle(dto, user?.id);
  }
}
```

---

## Battle Module

### `battle/battle.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { BattleController } from "./battle.controller";
import { BattleService } from "./battle.service";

@Module({
  controllers: [BattleController],
  providers: [BattleService],
})
export class BattleModule {}
```

### Add to `app.module.ts`

```typescript
import { BattleModule } from "./battle/battle.module";

@Module({
  imports: [..., BattleModule],
})
export class AppModule {}
```

---

## API Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/battle` | Optional (JWT) | Compare two titles |

### Request
```json
{
  "titleA": "10 Ways to Grow Your YouTube Channel",
  "titleB": "The Secret to Growing on YouTube in 2024"
}
```

### Response
```json
{
  "winner": {
    "title": "10 Ways to Grow Your YouTube Channel",
    "score": 78,
    "reason": "Stronger curiosity gap and social proof elements",
    "strengths": ["Clear value proposition", "Number specificity", "Action-oriented"],
    "weaknesses": ["Slightly generic for advanced creators"],
    "scoreExplanation": "The number hook and how-to pattern create higher click-through potential than the curiosity-only approach of title B."
  },
  "loser": {
    "title": "The Secret to Growing on YouTube in 2024",
    "score": 65,
    "reason": "Weaker structure, less specific value",
    "strengths": ["Curiosity trigger ('Secret')", "Timely ('2024')"],
    "weaknesses": ["Vague benefit", "No structural pattern", "Lower urgency"],
    "scoreExplanation": "While 'Secret' creates curiosity, the lack of a specific format reduces click-through confidence."
  },
  "summary": "Title A wins with its number-list pattern and clear value proposition",
  "hybridTitle": {
    "title": "10 Secrets to Growing Your YouTube Channel in 2024",
    "explanation": "Combines the specificity of Title A's number format with the curiosity trigger and timeliness of Title B"
  },
  "_preA": { "...pre-analysis data..." },
  "_preB": { "...pre-analysis data..." }
}
```

---

## Frontend Changes

### Files to DELETE
```
src/app/api/battle/route.ts  → replaced by NestJS controller
```

### Files to UPDATE
```
src/app/battle/page.tsx  → change fetch endpoint to /api/battle (same path, proxied)
```

---

## Acceptance Criteria

- [ ] `POST /api/battle` returns winner, loser, summary, hybrid title
- [ ] Pre-analysis data is attached to both titles before LLM call
- [ ] LLM receives real metrics and does not regenerate them
- [ ] Hybrid title is always generated
- [ ] Authenticated users have battle saved to DB
- [ ] Non-authenticated users get battle result without DB save
- [ ] Frontend battle page works via proxy
- [ ] Score matrix shows both titles side by side
- [ ] Merge suggestion card renders
