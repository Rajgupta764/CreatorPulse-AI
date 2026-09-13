# Module 09 — Repurpose (Content Atomizer)

> **Goal:** Adapt a YouTube title for 4 platforms (TikTok, Instagram, X/Twitter, LinkedIn) with platform-specific captions, hashtags, viral potential scores, and best posting times.

---

## Files to Create

```
packages/backend/src/repurpose/
├── repurpose.module.ts
├── repurpose.controller.ts
├── repurpose.service.ts
└── dto/
    └── repurpose.dto.ts
```

---

## DTO

### `repurpose/dto/repurpose.dto.ts`

```typescript
import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RepurposeDto {
  @ApiProperty({ example: "10 Ways to Grow Your YouTube Channel" })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: "tech", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  niche?: string;
}
```

---

## Repurpose Service

### `repurpose/repurpose.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { RepurposeDto } from "./dto/repurpose.dto";

@Injectable()
export class RepurposeService {
  constructor(private readonly groq: GroqService) {}

  async repurpose(dto: RepurposeDto) {
    const title = dto.title.trim();
    const niche = dto.niche?.trim() || "general";

    return this.callLLM(title, niche);
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
```

---

## Repurpose Controller

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RepurposeService } from "./repurpose.service";
import { RepurposeDto } from "./dto/repurpose.dto";

@ApiTags("Repurpose")
@Controller("repurpose")
export class RepurposeController {
  constructor(private readonly repurposeService: RepurposeService) {}

  @Post()
  async repurpose(@Body() dto: RepurposeDto) {
    return this.repurposeService.repurpose(dto);
  }
}
```

---

## Repurpose Module

```typescript
import { Module } from "@nestjs/common";
import { RepurposeController } from "./repurpose.controller";
import { RepurposeService } from "./repurpose.service";

@Module({
  controllers: [RepurposeController],
  providers: [RepurposeService],
})
export class RepurposeModule {}
```

---

## API Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/repurpose` | No | Repurpose title for platforms |

### Response
```json
{
  "originalTitle": "10 Ways to Grow Your YouTube Channel",
  "posts": [
    {
      "platform": "TikTok",
      "icon": "music",
      "title": "10 Ways to Grow Your Channel FAST",
      "caption": "Want more subscribers? Here's 10 ways that actually work...",
      "hashtags": ["#growontiktok", "#contentcreator", "#youtubetips"],
      "tips": ["Hook in the first 2 seconds with the number"],
      "viralPotentialIndex": 85,
      "bestPostingTime": "7-9 PM EST, Tuesday-Thursday"
    }
    // ... Instagram, X, LinkedIn posts
  ]
}
```

---

## Acceptance Criteria

- [ ] `POST /api/repurpose` returns 4 platform posts
- [ ] Posts are sorted by viral potential (highest first)
- [ ] Each post has title, caption, hashtags, tips, viralPotentialIndex, bestPostingTime
- [ ] Frontend repurpose page works via proxy
