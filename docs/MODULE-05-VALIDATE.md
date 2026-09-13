# Module 05 — Validate (Idea Incubator)

> **Goal:** Score a video idea across 6 dimensions (competition, demand, virality, difficulty, content gap, opportunity) and generate an evolved version if the score is below 70.

---

## Files to Create

```
packages/backend/src/validate/
├── validate.module.ts
├── validate.controller.ts
├── validate.service.ts
└── dto/
    └── validate.dto.ts
```

---

## DTO

### `validate/dto/validate.dto.ts`

```typescript
import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ValidateDto {
  @ApiProperty({ example: "How to edit videos faster using keyboard shortcuts" })
  @IsString()
  @MaxLength(1000)
  idea: string;

  @ApiProperty({ example: "tech", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  niche?: string;
}
```

---

## Validate Service

### `validate/validate.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { GroqService } from "../common/groq.service";
import { ValidateDto } from "./dto/validate.dto";

@Injectable()
export class ValidateService {
  constructor(private readonly groq: GroqService) {}

  async validate(dto: ValidateDto) {
    const idea = dto.idea.trim();
    const niche = dto.niche?.trim();

    return this.callLLM(idea, niche);
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
```

---

## Validate Controller

### `validate/validate.controller.ts`

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ValidateService } from "./validate.service";
import { ValidateDto } from "./dto/validate.dto";

@ApiTags("Validate")
@Controller("validate")
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}

  @Post()
  async validate(@Body() dto: ValidateDto) {
    return this.validateService.validate(dto);
  }
}
```

---

## Validate Module

### `validate/validate.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { ValidateController } from "./validate.controller";
import { ValidateService } from "./validate.service";

@Module({
  controllers: [ValidateController],
  providers: [ValidateService],
})
export class ValidateModule {}
```

---

## API Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/validate` | No | Validate a video idea |

### Request
```json
{
  "idea": "How to edit videos faster using keyboard shortcuts",
  "niche": "tech"
}
```

### Response
```json
{
  "competition": { "score": 45, "explanation": "Many creators cover editing tips" },
  "demand": { "score": 82, "explanation": "High search volume for keyboard shortcuts" },
  "virality": { "score": 65, "explanation": "Shareable but not inherently controversial" },
  "difficulty": { "score": 35, "explanation": "Easy to produce with screen recording" },
  "contentGap": { "score": 70, "explanation": "Few creators focus specifically on shortcuts" },
  "opportunity": { "score": 68, "explanation": "Decent opportunity with specific angle" },
  "overallScore": 61,
  "recommendation": "Proceed with a focused angle — '10 Keyboard Shortcuts That Will Cut Your Editing Time in Half'",
  "evolution": {
    "evolvedIdea": "10 Keyboard Shortcuts That Will Cut Your Editing Time in Half (with Free Cheat Sheet)",
    "estimatedNewScore": 82,
    "explanation": "Adding a number and a lead magnet increases specificity and perceived value"
  }
}
```

---

## Frontend Changes

### Files to DELETE
```
src/app/api/validate-idea/route.ts  → replaced by NestJS controller
```

---

## Acceptance Criteria

- [ ] `POST /api/validate` returns 6 dimension scores + overall score
- [ ] If score < 70, `evolution` field is present with improved idea
- [ ] If score >= 70, `evolution` field may be null
- [ ] Frontend validate page works via proxy
