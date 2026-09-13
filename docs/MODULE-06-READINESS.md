# Module 06 — Readiness (Launch Command)

> **Goal:** Score a video's upload readiness across title, description, hook, and thumbnail — with a Go/No-Go recommendation and improvement checklist.

---

## Files to Create

```
packages/backend/src/readiness/
├── readiness.module.ts
├── readiness.controller.ts
├── readiness.service.ts
└── dto/
    └── readiness.dto.ts
```

---

## DTO

### `readiness/dto/readiness.dto.ts`

```typescript
import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ReadinessDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  hook?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  thumbnail?: string;
}
```

---

## Readiness Service

### `readiness/readiness.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { ReadinessDto } from "./dto/readiness.dto";

@Injectable()
export class ReadinessService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService
  ) {}

  async score(dto: ReadinessDto, userId?: string) {
    const input = {
      title: dto.title.trim(),
      description: (dto.description || "").trim(),
      hook: (dto.hook || "").trim(),
      thumbnail: (dto.thumbnail || "").trim(),
    };

    const result = await this.callLLM(input);

    if (userId) {
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
```

---

## Readiness Controller

### `readiness/readiness.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ReadinessService } from "./readiness.service";
import { ReadinessDto } from "./dto/readiness.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Readiness")
@Controller("readiness")
export class ReadinessController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async score(
    @Body() dto: ReadinessDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.readinessService.score(dto, user?.id);
  }
}
```

---

## Readiness Module

### `readiness/readiness.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { ReadinessController } from "./readiness.controller";
import { ReadinessService } from "./readiness.service";

@Module({
  controllers: [ReadinessController],
  providers: [ReadinessService],
})
export class ReadinessModule {}
```

---

## API Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/readiness` | Optional (JWT) | Score upload readiness |

### Response
```json
{
  "overallScore": 72,
  "titleScore": 85,
  "descriptionScore": 68,
  "hookScore": 70,
  "thumbnailScore": 65,
  "weakestArea": "thumbnail",
  "strongestArea": "title",
  "recommendation": "Your title is strong but your thumbnail needs work",
  "finalAdvice": "Improve thumbnail text contrast and add a focal point",
  "goNoGo": "go",
  "improvementChecklist": [
    "Increase thumbnail text size for mobile viewers",
    "Add a contrasting background color",
    "Include a clear focal point (face or object)",
    "Write 2 more description sentences targeting keywords"
  ]
}
```

---

## Acceptance Criteria

- [ ] `POST /api/readiness` returns all 4 component scores + overall
- [ ] `goNoGo` is either "go" or "no-go"
- [ ] `improvementChecklist` contains 3-5 items
- [ ] Authenticated users have result saved to DB
- [ ] Frontend readiness page works via proxy
