# Module 04 — Hook (Hook Lab)

> **Goal:** Generate 3 different 30-second opening hook scripts for a YouTube video in different styles (question, bold statement, storytelling).

---

## Files to Create

```
packages/backend/src/hook/
├── hook.module.ts
├── hook.controller.ts
├── hook.service.ts
└── dto/
    └── hook.dto.ts
```

---

## DTO

### `hook/dto/hook.dto.ts`

```typescript
import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class HookDto {
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

## Hook Service

### `hook/hook.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { HookDto } from "./dto/hook.dto";

@Injectable()
export class HookService {
  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService
  ) {}

  async generate(dto: HookDto, userId?: string) {
    const title = dto.title.trim();
    const niche = dto.niche?.trim() || "general";

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
```

---

## Hook Controller

### `hook/hook.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { HookService } from "./hook.service";
import { HookDto } from "./dto/hook.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Hook")
@Controller("hook")
export class HookController {
  constructor(private readonly hookService: HookService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generate(
    @Body() dto: HookDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.hookService.generate(dto, user?.id);
  }
}
```

---

## Hook Module

### `hook/hook.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { HookController } from "./hook.controller";
import { HookService } from "./hook.service";

@Module({
  controllers: [HookController],
  providers: [HookService],
})
export class HookModule {}
```

---

## API Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/hook` | Optional (JWT) | Generate 3 hook scripts |

### Request
```json
{
  "title": "10 Ways to Grow Your YouTube Channel",
  "niche": "tech"
}
```

### Response
```json
{
  "hooks": [
    {
      "style": "question",
      "hook": "Full 30-second question hook script...",
      "tone": "Curious and engaging",
      "deliveryTip": "Pause for 2 seconds after asking the question",
      "estimatedDuration": "~30 seconds"
    },
    {
      "style": "bold statement",
      "hook": "Full 30-second bold statement hook script...",
      "tone": "Confident and direct",
      "deliveryTip": "Lead with strong eye contact and a deliberate pace",
      "estimatedDuration": "~30 seconds"
    },
    {
      "style": "storytelling",
      "hook": "Full 30-second storytelling hook script...",
      "tone": "Relatable and conversational",
      "deliveryTip": "Use hand gestures to paint the scene",
      "estimatedDuration": "~30 seconds"
    }
  ]
}
```

---

## Frontend Changes

### Files to DELETE
```
src/app/api/hook/route.ts  → replaced by NestJS controller
```

---

## Acceptance Criteria

- [ ] `POST /api/hook` returns 3 hooks (question, bold statement, storytelling)
- [ ] Each hook has style, tone, deliveryTip, and estimated duration
- [ ] Authenticated users have hook saved to DB
- [ ] Frontend hook page works via proxy
- [ ] 3 hook options displayed in tabs or carousel
