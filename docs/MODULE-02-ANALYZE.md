# Module 02 — Analyze (Title DNA Analyzer)

> **Goal:** Migrate the Title DNA Analyzer from the old Next.js API route to a NestJS module. This is the core feature — it runs pre-analysis (real metrics, patterns, power words, readability, virality score), enriches with LLM, compares against user history, and generates similar titles + description.

---

## Files to Create

```
packages/backend/src/analyze/
├── analyze.module.ts
├── analyze.controller.ts
├── analyze.service.ts
├── dto/
│   └── analyze.dto.ts

packages/backend/src/common/groq.service.ts       # Already created in Module 00
packages/backend/src/common/engine/                # Already created in Module 00
├── analyzer-engine.ts
├── power-words.ts
└── index.ts
```

---

## DTO

### `analyze/dto/analyze.dto.ts`

```typescript
import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AnalyzeDto {
  @ApiProperty({ example: "10 Ways to Grow Your YouTube Channel in 2024" })
  @IsString()
  @MinLength(1)
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

## Analyze Service

### `analyze/analyze.service.ts`

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { runPreAnalysis, getWeakestDimension, generateNextAction } from "../common/engine";
import { GroqService } from "../common/groq.service";
import { PrismaService } from "../prisma/prisma.service";
import { AnalyzeDto } from "./dto/analyze.dto";

@Injectable()
export class AnalyzeService {
  private readonly logger = new Logger(AnalyzeService.name);

  constructor(
    private readonly groq: GroqService,
    private readonly prisma: PrismaService
  ) {}

  async analyze(dto: AnalyzeDto, userId?: string) {
    const title = dto.title.trim();
    const niche = dto.niche?.trim() || "general";

    // Layer 1: Pre-Analysis (pure functions)
    const preAnalysis = runPreAnalysis(title);

    // Layer 2: User Context (if authenticated)
    let userContext = null;
    if (userId) {
      userContext = await this.getUserContext(userId);
    }

    // Layer 3: LLM Enrichment
    const analysis = await this.callLLM(title, preAnalysis, niche);

    // Layer 4: Post-Processing
    analysis.characterCount = preAnalysis.characterCount;
    analysis.readabilityScore = preAnalysis.readabilityScore;
    analysis.patterns = preAnalysis.detectedPatterns;
    analysis.powerWords = preAnalysis.powerWords;
    analysis.viralityScore = preAnalysis.computedViralityScore;
    analysis.computedViralityScore = preAnalysis.computedViralityScore;

    if (analysis.psychology) {
      const weakest = getWeakestDimension(analysis.psychology);
      analysis.nextAction = generateNextAction(
        weakest.name,
        analysis.powerWords,
        preAnalysis.computedViralityScore,
        analysis.viralityScore,
        analysis.patterns
      );
    }

    if (userContext) {
      analysis.userContext = userContext;
    }

    // LLM calls for titles + description (can run in parallel)
    const [titlesResult, descResult] = await Promise.allSettled([
      this.generateTitles(title, preAnalysis, niche),
      this.generateDescription(title, niche),
    ]);

    const titles = titlesResult.status === "fulfilled" ? titlesResult.value : [];
    const description = descResult.status === "fulfilled"
      ? descResult.value
      : { description: "", chapters: [], hashtags: [] };

    // Save to DB (if authenticated)
    if (userId) {
      await this.saveToDb(userId, title, niche, analysis, titles, description);
      await this.incrementUsage(userId);
    }

    return { analysis, titles, description };
  }

  private async callLLM(title: string, pre: any, niche: string): Promise<any> {
    const prompt = `You are a viral YouTube content strategist and psychologist. Analyze the following YouTube video title.

Here are the REAL metrics computed from this title:
- Character count: ${pre.characterCount}
- Word count: ${pre.wordCount}
- Contains number: ${pre.hasNumber}
- Contains question mark: ${pre.hasQuestionMark}
- Contains colon: ${pre.hasColon}
- Is comparison (X vs Y): ${pre.isComparison}
- Is listicle/number format: ${pre.isListicle}
- Starts with "How to": ${pre.startsWithHowTo}
- Starts with a question word: ${pre.startsWithQuestion}
- Viral patterns detected: ${pre.detectedPatterns.join(", ") || "none"}
- Power words found: ${pre.powerWords.join(", ") || "none"}
- Readability score: ${pre.readabilityScore}/100
- Computed virality score (from real metrics): ${pre.computedViralityScore}/100

Based on this REAL DATA, provide a deeper psychological and strategic analysis:

1. Emotional triggers — which emotions does this title evoke? (choose from: fear, greed, curiosity, outrage, aspiration, surprise, humor, nostalgia, inspiration)
2. Hook type — what kind of hook does this use? (question, bold statement, number, curiosity gap, how-to, comparison, controversy, transformation)
3. Psychology scores (0-100) for each dimension:
   - Curiosity: does it create an information gap?
   - Authority: does it position the creator as an expert?
   - Novelty: does it promise something new or unexpected?
   - Emotion: does it evoke a strong emotional response?
   - Conflict: does it present tension or opposition?
   - Specificity: does it use precise numbers, names, or details?
   - Urgency: does it make the viewer feel they need to watch now?
4. Target audience — describe the ideal viewer this title appeals to (2-3 sentences)
5. CTR explanation — 2-3 sentences explaining exactly WHY this title earns clicks, incorporating the real metrics above
6. Why it works — holistic explanation incorporating the real metrics (2-3 sentences)

Base your analysis on the provided real data. Do NOT contradict it. Do NOT re-list the patterns, power words, or character count — they are already shown to the user.

Respond ONLY with valid JSON:
{
  "emotionalTriggers": string[],
  "hookType": string,
  "psychology": {
    "curiosity": number,
    "authority": number,
    "novelty": number,
    "emotion": number,
    "conflict": number,
    "specificity": number,
    "urgency": number
  },
  "targetAudience": string,
  "ctrExplanation": string,
  "whyItWorks": string
}

Title: "${title}"`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }

  private async generateTitles(title: string, pre: any, niche: string): Promise<any[]> {
    const prompt = `You are a viral YouTube content strategist. Given a winning video title and a target niche, generate 5 structurally similar titles.

The original title has these real characteristics:
- Pattern structure: ${pre.detectedPatterns.join(", ")}
- Character count range: ${pre.characterCount} chars
- It uses power words like: ${pre.powerWords.join(", ") || "none"}
- Length flag: ${pre.lengthFlag}

For each generated title:
1. Preserve the SAME viral pattern structure as the original
2. Match the character length (aim for ${Math.max(20, pre.characterCount - 10)}-${pre.characterCount + 10} chars)
3. Be optimized for the "${niche}" niche
4. Include power words similar to the original when possible
5. Explain why this specific title would perform well in the target niche

Respond ONLY with valid JSON:
{
  "titles": [
    {
      "title": "Generated title",
      "pattern": "Which viral pattern this uses",
      "whyWorks": "Brief 1-sentence explanation why this would perform well in ${niche}"
    }
  ]
}

Original title: "${title}"
Target niche: "${niche}"`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json).titles || [];
  }

  private async generateDescription(title: string, niche: string): Promise<any> {
    const prompt = `You are a viral YouTube content strategist. Write a YouTube video description for a video titled "${title}" in the "${niche}" niche.

Structure:
1. Hook paragraph (2-3 sentences) - grab attention, tease the transformation or result
2. Value body (3-4 sentences) - what the viewer will learn, key takeaways
3. Chapter markers (4-6 timestamps with labels)
4. Call to action (like, subscribe, comment)
5. 5-8 relevant hashtags

Tone: Energetic, confident, conversational. Use power words. Keep paragraphs short.

IMPORTANT: The "description" field must be a single-line string without actual line breaks. Use \\n escape sequences for line breaks instead of real newlines.

Respond ONLY with valid JSON:
{
  "description": "string with \\n for line breaks",
  "chapters": [{"time": "0:00", "label": "Hook"}],
  "hashtags": ["#viral", "#niche"]
}`;

    const raw = await this.groq.call(prompt);
    const json = this.groq.extractJson(raw);
    return this.groq.safeParse(json);
  }

  private async getUserContext(userId: string) {
    const generations = await this.prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (generations.length === 0) {
      return {
        personalAverageVirality: null,
        personalBestVirality: null,
        mostUsedPattern: null,
        bestPerformingPattern: null,
        totalAnalyses: 0,
      };
    }

    let totalScore = 0;
    let bestScore = 0;
    const patternScores: Record<string, { total: number; count: number }> = {};

    for (const gen of generations) {
      const a = gen.analysis as any;
      const score = a.viralityScore ?? 0;
      totalScore += score;
      if (score > bestScore) bestScore = score;

      const patterns: string[] = a.patterns ?? [];
      for (const p of patterns) {
        if (!patternScores[p]) patternScores[p] = { total: 0, count: 0 };
        patternScores[p].total += score;
        patternScores[p].count += 1;
      }
    }

    let mostUsedPattern: string | null = null;
    let bestPerformingPattern: string | null = null;
    let mostUsedCount = 0;
    let bestAvg = 0;

    for (const [pattern, stats] of Object.entries(patternScores)) {
      if (stats.count > mostUsedCount) {
        mostUsedCount = stats.count;
        mostUsedPattern = pattern;
      }
      const avg = stats.total / stats.count;
      if (avg > bestAvg && stats.count >= 2) {
        bestAvg = avg;
        bestPerformingPattern = pattern;
      }
    }

    return {
      personalAverageVirality: Math.round(totalScore / generations.length),
      personalBestVirality: bestScore,
      mostUsedPattern,
      bestPerformingPattern,
      totalAnalyses: generations.length,
    };
  }

  private async saveToDb(userId: string, title: string, niche: string, analysis: any, titles: any[], description: any) {
    await this.prisma.generation.create({
      data: {
        userId,
        inputTitle: title,
        niche,
        analysis,
        generatedTitles: titles,
        generatedDescription: description,
      },
    });
  }

  private async incrementUsage(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { count: { increment: 1 } },
      create: { userId, date: today, count: 1 },
    });
  }
}
```

---

## Analyze Controller

### `analyze/analyze.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards, Optional } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyzeService } from "./analyze.service";
import { AnalyzeDto } from "./dto/analyze.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Analyze")
@Controller("analyze")
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async analyze(
    @Body() dto: AnalyzeDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.analyzeService.analyze(dto, user?.id);
  }
}
```

---

## Analyze Module

### `analyze/analyze.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { AnalyzeController } from "./analyze.controller";
import { AnalyzeService } from "./analyze.service";

@Module({
  controllers: [AnalyzeController],
  providers: [AnalyzeService],
})
export class AnalyzeModule {}
```

### Add to `app.module.ts`

```typescript
import { AnalyzeModule } from "./analyze/analyze.module";

@Module({
  imports: [PrismaModule, CommonModule, AuthModule, AnalyzeModule],
})
export class AppModule {}
```

---

## API Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/analyze` | Optional (JWT) | Analyze a YouTube title |

### Request
```json
{
  "title": "10 Ways to Grow Your YouTube Channel in 2024",
  "niche": "tech"
}
```

### Response
```json
{
  "analysis": {
    "viralityScore": 72,
    "computedViralityScore": 72,
    "patterns": ["How-To", "Number/Listicle"],
    "powerWords": ["ways", "grow"],
    "characterCount": 42,
    "readabilityScore": 78,
    "emotionalTriggers": ["curiosity", "aspiration"],
    "hookType": "number",
    "psychology": { "curiosity": 82, "authority": 45, "novelty": 63, "emotion": 71, "conflict": 22, "specificity": 65, "urgency": 55 },
    "targetAudience": "string",
    "ctrExplanation": "string",
    "whyItWorks": "string",
    "predictedStrengths": ["string"],
    "userContext": { "personalAverageVirality": 58, "personalBestVirality": 92, "mostUsedPattern": "How-To", "bestPerformingPattern": "Curiosity Gap", "totalAnalyses": 24 },
    "nextAction": "Add an emotional trigger word to boost your score"
  },
  "titles": [
    { "title": "Generated title", "pattern": "How-To", "whyWorks": "Explanation" }
  ],
  "description": {
    "description": "Hook paragraph...\\n\\nValue body...",
    "chapters": [{ "time": "0:00", "label": "Intro" }],
    "hashtags": ["#viral", "#tech"]
  }
}
```

---

## Database

### Table: `generations`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| input_title | TEXT | Original title |
| niche | TEXT? | User-provided or "general" |
| analysis | JSONB | Full analysis object |
| generated_titles | JSONB | Array of 5 similar titles |
| generated_description | JSONB | Video description + chapters + hashtags |
| created_at | TIMESTAMPTZ | Default now() |

### Table: `daily_usage`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, unique with date |
| date | DATE | Current date |
| count | INT | Number of analyses today |

---

## Frontend Changes

### Files to DELETE from Frontend
```
src/app/api/generate/route.ts         → replaced by NestJS controller
src/lib/gemini.ts (analyzeTitle, generateSimilarTitles, generateDescription, generateAll) → moved to AnalyzeService
```

### Files to KEEP in Frontend
```
src/app/generate/page.tsx              → Update fetch to use /api/analyze
src/components/generator/dna-analyzer.tsx → No changes needed (uses response shape)
src/components/generator/title-results.tsx → No changes needed
src/components/generator/description-result.tsx → No changes needed
src/components/generator/title-input.tsx → No changes needed
src/lib/analyzer-engine.ts             → Keep for optional optimistic UI
```

### Update `src/app/generate/page.tsx`

Replace `fetch("/api/generate", ...)` with:

```typescript
const res = await fetch("/api/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify({ title, niche }),
});
```

Or use the `apiFetch` utility from Module 01 if authenticated.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Empty title | Returns 400 — "title must be a string" |
| Title > 500 chars | Returns 400 — ValidationPipe |
| First-time user (no history) | `userContext` is null; UI shows "Start analyzing to unlock personal benchmarks" |
| Title with only emojis | Engine still computes metrics; LLM handles enrichment |
| Non-English title | Power word detection may be empty; pattern detection limited to structure |
| LLM call fails | Returns partial result with engine data only, graceful degradation |
| Guest user (no JWT) | `user` is undefined; runs without user context, no DB save |
| Rate limited | Returns 429 if daily limit exceeded (handled in Usage Module) |

---

## Acceptance Criteria

- [ ] `POST /api/analyze` returns analysis, titles, and description
- [ ] `viralityScore` and `computedViralityScore` match the engine's deterministic score
- [ ] `patterns` and `powerWords` come from the engine, NOT the LLM
- [ ] LLM never regenerates character count, word count, or pattern detection
- [ ] Authenticated users get `userContext` with personal averages
- [ ] Analysis is saved to `generations` table for authenticated users
- [ ] `daily_usage` is incremented for authenticated users
- [ ] Non-authenticated users get analysis without DB save
- [ ] Response matches the documented shape exactly
- [ ] Frontend `/generate` page loads and submits successfully via proxy
- [ ] Score bars, psychology chart, and "Your Next Move" render correctly
