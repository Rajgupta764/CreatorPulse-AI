# CreatorPulse AI — Feature Planning Document

> **From generic title generator to personal Content Strategy OS — a system creators use daily to optimize every video.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Feature Modules — Backend (NestJS)](#5-feature-modules--backend-nestjs)
   - A. Auth Module
   - B. Analyze Module (Title DNA Analyzer)
   - C. Battle Module (Title Fusion Lab)
   - D. Hook Module (Hook Lab)
   - E. Validate Module (Idea Incubator)
   - F. Readiness Module (Launch Command)
   - G. Comments Module (Audience Compass)
   - H. Content-Gap Module (Opportunity Map)
   - I. Repurpose Module (Content Atomizer)
   - J. Dashboard Module (Growth Command Center)
   - K. Usage Module
6. [Frontend Pages (Next.js)](#6-frontend-pages-nextjs)
7. [API Routes — NestJS Endpoints](#7-api-routes--nestjs-endpoints)
8. [Data Flow & Multi-Pass Pipeline](#8-data-flow--multi-pass-pipeline)
9. [Development Roadmap](#9-development-roadmap)

---

## 1. Project Overview

CreatorPulse AI is a **Research Intelligence Platform** for YouTube creators. It replaces generic AI chat output with personal, data-anchored, cross-referenced intelligence that makes every creator's content strategy sharper.

### Target User
YouTube creators (100–100K subscribers) who:
- Post at least 1–2 videos per week
- Care about click-through rate and audience growth
- Currently use ChatGPT for title ideas (and feel the results are generic)
- Want a system that learns their style and niche

### North Star Metric
**Daily Active Creators (DAC)** — users who interact with at least 2 features per day.

---

## 2. Architecture & Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend Framework** | NestJS 11 | Modular Node.js backend |
| **Frontend Framework** | Next.js 16 (App Router) | React with SSR, kept as frontend |
| **Language** | TypeScript 5 | Type safety across both layers |
| **Database** | PostgreSQL 16 (Docker) | Primary data store |
| **ORM** | Prisma | Type-safe DB access, migrations |
| **Auth** | Custom JWT (bcrypt + JWT tokens) | Authentication & authorization |
| **AI/LLM** | Groq API (llama-3.3-70b-versatile) via OpenAI SDK | LLM inference |
| **Styling** | Tailwind CSS v4 + shadcn/ui (base-nova) | Dark-themed UI with OKLCH brand colors |
| **Validation** | class-validator + class-transformer | DTO validation (NestJS) |
| **API Docs** | Swagger / OpenAPI | Auto-generated API documentation |

### Architectural Principle: Multi-Pass Pipeline

```
User Input
  → Layer 1: Pre-Analysis Engine (hardcoded rules, real metrics, regex patterns)
  → Layer 2: LLM Enrichment (prompted with pre-computed data, not guessing from scratch)
  → Layer 3: Personal Context (compare vs user's history, niche averages)
  → Layer 4: Cross-Feature Lookup (related data from other features)
  → Rich structured output with benchmarks → Analytics UI
```

---

## 3. Monorepo Structure

```
creatorpulse/
├── packages/
│   ├── backend/                     # NestJS application
│   │   ├── prisma/
│   │   │   └── schema.prisma       # All database models
│   │   ├── src/
│   │   │   ├── main.ts             # App bootstrap
│   │   │   ├── app.module.ts       # Root module
│   │   │   ├── common/             # Shared guards, decorators, filters, interceptors
│   │   │   │   ├── guards/
│   │   │   │   │   └── jwt-auth.guard.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   └── current-user.decorator.ts
│   │   │   │   └── filters/
│   │   │   │       └── http-exception.filter.ts
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   └── login.dto.ts
│   │   │   │   └── strategies/
│   │   │   │       └── jwt.strategy.ts
│   │   │   ├── analyze/
│   │   │   │   ├── analyze.module.ts
│   │   │   │   ├── analyze.controller.ts
│   │   │   │   ├── analyze.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   └── analyze.dto.ts
│   │   │   │   └── engine/
│   │   │   │       ├── analyzer-engine.ts      # Pure functions: metrics, patterns, scores
│   │   │   │       ├── power-words.ts           # Power word dictionary
│   │   │   │       └── analyzer-engine.spec.ts  # Unit tests
│   │   │   ├── battle/
│   │   │   │   ├── battle.module.ts
│   │   │   │   ├── battle.controller.ts
│   │   │   │   ├── battle.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── battle.dto.ts
│   │   │   ├── hook/
│   │   │   │   ├── hook.module.ts
│   │   │   │   ├── hook.controller.ts
│   │   │   │   ├── hook.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── hook.dto.ts
│   │   │   ├── validate/
│   │   │   │   ├── validate.module.ts
│   │   │   │   ├── validate.controller.ts
│   │   │   │   ├── validate.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── validate.dto.ts
│   │   │   ├── readiness/
│   │   │   │   ├── readiness.module.ts
│   │   │   │   ├── readiness.controller.ts
│   │   │   │   ├── readiness.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── readiness.dto.ts
│   │   │   ├── comments/
│   │   │   │   ├── comments.module.ts
│   │   │   │   ├── comments.controller.ts
│   │   │   │   ├── comments.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── comments.dto.ts
│   │   │   ├── content-gap/
│   │   │   │   ├── content-gap.module.ts
│   │   │   │   ├── content-gap.controller.ts
│   │   │   │   ├── content-gap.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── content-gap.dto.ts
│   │   │   ├── repurpose/
│   │   │   │   ├── repurpose.module.ts
│   │   │   │   ├── repurpose.controller.ts
│   │   │   │   ├── repurpose.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── repurpose.dto.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.module.ts
│   │   │   │   ├── dashboard.controller.ts
│   │   │   │   ├── dashboard.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── dashboard.dto.ts
│   │   │   └── usage/
│   │   │       ├── usage.module.ts
│   │   │       ├── usage.controller.ts
│   │   │       ├── usage.service.ts
│   │   │       └── dto/
│   │   │           └── usage.dto.ts
│   │   ├── test/                    # E2E tests
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   └── package.json
│   │
│   ├── frontend/                   # Next.js application (existing code moved here)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── logout/
│   │   │   │   │   └── signup/
│   │   │   │   ├── generate/
│   │   │   │   ├── battle/
│   │   │   │   ├── hook/
│   │   │   │   ├── validate/
│   │   │   │   ├── readiness/
│   │   │   │   ├── comments/
│   │   │   │   ├── content-gap/
│   │   │   │   ├── repurpose/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── api/               ← DELETED (moved to NestJS backend)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── generator/
│   │   │   │   │   ├── battle-mode.tsx
│   │   │   │   │   ├── comment-intelligence.tsx
│   │   │   │   │   ├── content-gap-finder.tsx
│   │   │   │   │   ├── description-result.tsx
│   │   │   │   │   ├── dna-analyzer.tsx
│   │   │   │   │   ├── hook-bridge.tsx
│   │   │   │   │   ├── idea-validator.tsx
│   │   │   │   │   ├── readiness-score.tsx
│   │   │   │   │   ├── repurposer.tsx
│   │   │   │   │   ├── score-card-export.tsx
│   │   │   │   │   ├── title-input.tsx
│   │   │   │   │   └── title-results.tsx
│   │   │   │   ├── landing/
│   │   │   │   │   ├── cta.tsx
│   │   │   │   │   ├── demo-widget.tsx
│   │   │   │   │   ├── features.tsx
│   │   │   │   │   ├── grain-overlay.tsx
│   │   │   │   │   └── hero.tsx
│   │   │   │   ├── shared/
│   │   │   │   │   └── nav.tsx
│   │   │   │   └── ui/                 # shadcn components
│   │   │   ├── hooks/
│   │   │   │   └── use-in-view.ts
│   │   │   ├── lib/
│   │   │   │   ├── analyzer-engine.ts   ← KEPT (frontend can use for pre-analysis display)
│   │   │   │   ├── dashboard-service.ts ← MOVED to NestJS
│   │   │   │   ├── gemini.ts           ← MOVED to NestJS
│   │   │   │   ├── user-profile.ts     ← MOVED to NestJS
│   │   │   │   ├── utils.ts
│   │   │   │   ├── data/
│   │   │   │   │   └── power-words.ts
│   │   │   │   └── supabase/
│   │   │   │       ├── client.ts       ← KEPT (browser-side Supabase client for existing auth)
│   │   │   │       ├── middleware.ts
│   │   │   │       └── server.ts
│   │   │   └── types/
│   │   │       └── index.ts             ← Shared types, kept in frontend
│   │   ├── next.config.ts              ← Updated with proxy re-writes to NestJS
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── shared/                        # Shared types & DTOs (future)
│       ├── src/
│       │   ├── types/
│       │   │   └── index.ts
│       │   └── dto/
│       └── package.json
│
├── docker-compose.yml                 # PostgreSQL + services
├── .gitignore
├── package.json                       # Root workspace (npm workspaces)
└── README.md
```

---

## 4. Database Schema (Prisma)

### Models (from existing Supabase `00001_init.sql` + `00002_cross_feature.sql`)

#### `User`
```prisma
model User {
  id             String   @id @default(uuid()) @db.Uuid
  email          String   @unique
  passwordHash   String   @map("password_hash")
  displayName    String?  @map("display_name")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  generations      Generation[]
  dailyUsage       DailyUsage[]
  battles          Battle[]
  commentAnalyses  CommentAnalysis[]
  hooks            Hook[]
  readinessScores  ReadinessScore[]
  contentGaps      ContentGap[]

  @@map("users")
}
```

#### `Generation`
```prisma
model Generation {
  id                  String   @id @default(uuid()) @db.Uuid
  userId              String   @map("user_id") @db.Uuid
  inputTitle          String   @map("input_title")
  niche               String?
  analysis            Json
  generatedTitles     Json     @map("generated_titles")
  generatedDescription Json    @map("generated_description")
  createdAt           DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@map("generations")
}
```

#### `DailyUsage`
```prisma
model DailyUsage {
  id     String   @id @default(uuid()) @db.Uuid
  userId String   @map("user_id") @db.Uuid
  date   DateTime @db.Date
  count  Int      @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@map("daily_usage")
}
```

#### `Battle`
```prisma
model Battle {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  titleA      String   @map("title_a")
  titleB      String   @map("title_b")
  winnerTitle String   @map("winner_title")
  winnerScore Int      @map("winner_score")
  loserScore  Int      @map("loser_score")
  analysis    Json
  createdAt   DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@map("battles")
}
```

#### `CommentAnalysis`
```prisma
model CommentAnalysis {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @map("user_id") @db.Uuid
  inputComments String   @map("input_comments")
  analysis      Json
  createdAt     DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@map("comment_analyses")
}
```

#### `Hook`
```prisma
model Hook {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  inputTitle String   @map("input_title")
  niche      String?
  analysis   Json
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("hooks")
}
```

#### `ReadinessScore`
```prisma
model ReadinessScore {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  input     Json
  analysis  Json
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("readiness_scores")
}
```

#### `ContentGap`
```prisma
model ContentGap {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  inputUrls   String?  @map("input_urls")
  inputTopics String?  @map("input_topics")
  analysis    Json
  createdAt   DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("content_gaps")
}
```

---

## 5. Feature Modules — Backend (NestJS)

### A. Auth Module

| Aspect | Detail |
|---|---|
| **Controller** | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| **Service** | `AuthService` — register (bcrypt hash), login (validate + return JWT), profile |
| **Strategy** | `JwtStrategy` — extracts JWT from `Authorization: Bearer <token>` header, validates via `jsonwebtoken` |
| **Guard** | `JwtAuthGuard` — applies to all protected routes |
| **DTOs** | `RegisterDto` (email, password, displayName), `LoginDto` (email, password) |
| **Storage** | `users` table via Prisma |

#### Auth Flow
```
Client → POST /api/auth/register { email, password, displayName }
  → AuthService: hash password with bcrypt
  → Prisma: create User record
  → Return { id, email, displayName }

Client → POST /api/auth/login { email, password }
  → AuthService: find user by email
  → bcrypt.compare(password, user.passwordHash)
  → Generate JWT (payload: { sub: user.id, email: user.email })
  → Return { access_token, user }

Client → GET /api/auth/me (Authorization: Bearer <token>)
  → JwtAuthGuard validates token
  → Return user profile
```

---

### B. Analyze Module (Title DNA Analyzer)

| Aspect | Detail |
|---|---|
| **Controller** | `POST /api/analyze` |
| **Service** | `AnalyzeService` — orchestrates pre-analysis + LLM enrichment + personal context |
| **Engine** | `AnalyzerEngine` — pure functions for real metrics, power words, patterns, readability, virality score |
| **AI** | `GeminiService` (or `GroqService`) — LLM calls for deep psychology, target audience, CTR explanation |
| **DTO** | `AnalyzeDto` (title: string, niche?: string) |

#### Pipeline (Multi-Pass)
```
1. Pre-Analysis (pure functions, <1ms):
   - computeRealMetrics(title) → characterCount, wordCount, hasNumber, etc.
   - detectPowerWords(title) → power words from dictionary
   - detectPatterns(title, metrics) → patterns via regex
   - computeReadability(title) → 0-100 score
   - computeViralityScore(metrics, powerWords, patterns) → 0-100 score

2. User Context (from DB, when authenticated):
   - getUserProfile(userId) → personalAverageVirality, bestPerformingPattern, etc.
   - getRecentTitles(userId) → last 5 titles

3. LLM Enrichment (Groq API call):
   - Feed pre-analysis data into prompt
   - LLM provides: psychology scores, emotional triggers, hook type, target audience, CTR explanation
   - LLM does NOT re-compute what the engine already computed

4. Post-Processing:
   - Merge computed + LLM data
   - Generate "weakest dimension" and "next action" suggestions
   - Attach user context (personal averages comparison)

5. Save to DB (if authenticated)
```

#### Response Shape
```typescript
{
  analysis: {
    viralityScore: number,          // from engine
    computedViralityScore: number,  // same as above, kept for clarity
    patterns: string[],             // from engine
    powerWords: string[],           // from engine
    characterCount: number,         // from engine
    readabilityScore: number,       // from engine
    emotionalTriggers: string[],    // from LLM
    hookType: string,               // from LLM
    psychology: {                   // from LLM
      curiosity: number,
      authority: number,
      novelty: number,
      emotion: number,
      conflict: number,
      specificity: number,
      urgency: number
    },
    targetAudience: string,         // from LLM
    ctrExplanation: string,         // from LLM
    whyItWorks: string,             // from LLM
    predictedStrengths: string[],   // from LLM
    userContext?: UserContext,      // from DB
    nextAction: string,             // generated post-process
  },
  titles: GeneratedTitle[],         // from LLM (5 similar titles)
  description: GeneratedDescription // from LLM (video description + chapters)
}
```

---

### C. Battle Module (Title Fusion Lab)

| Aspect | Detail |
|---|---|
| **Controller** | `POST /api/battle` |
| **Service** | `BattleService` — runs pre-analysis on both titles, LLM comparison, saves to DB |
| **DTO** | `BattleDto` (titleA: string, titleB: string) |

#### Pipeline
```
1. Pre-analysis on titleA and titleB separately
2. LLM prompt: feed both pre-analysis results, ask for comparison + hybrid suggestion
3. Save battle result to `battles` table (if authenticated)
4. Return: winner entry, loser entry, summary, hybrid title, pre-analysis data
```

---

### D. Hook Module (Hook Lab)

| Aspect | Detail |
|---|---|
| **Controller** | `POST /api/hook` |
| **Service** | `HookService` — LLM generates 3 hook variations |
| **DTO** | `HookDto` (title: string, niche?: string) |

#### Hooks Generated
1. **Question hook** — starts with a provocative question
2. **Bold statement hook** — starts with a strong, surprising claim
3. **Storytelling hook** — starts with a brief personal story or scenario

Each hook includes: full script, tone description, delivery tip, estimated duration.

---

### E. Validate Module (Idea Incubator)

| Aspect | Detail |
|---|---|
| **Controller** | `POST /api/validate` |
| **Service** | `ValidateService` — LLM scores 6 dimensions of a video idea |
| **DTO** | `ValidateDto` (idea: string) |

#### Dimensions Scored
1. Competition (how saturated?)
2. Demand (search interest?)
3. Virality (shareability?)
4. Difficulty (how hard to execute?)
5. Content Gap (unique angle?)
6. Opportunity (overall opportunity)

If score < 70, LLM generates an **evolved version** of the idea with estimated improved score.

---

### F. Readiness Module (Launch Command)

| Aspect | Detail |
|---|---|
| **Controller** | `POST /api/readiness` |
| **Service** | `ReadinessService` — LLM evaluates title + description + hook + thumbnail |
| **DTO** | `ReadinessDto` (title, description, hook, thumbnail) |

#### Output Includes
- Individual scores for each component (0-100)
- Overall score
- Weakest/strongest area
- Go/No-Go recommendation
- Improvement checklist (3-5 items)
- Comparison with last readiness check (if available)

---

### G. Comments Module (Audience Compass)

| Aspect | Detail |
|---|---|
| **Controller** | `POST /api/comments` |
| **Service** | `CommentsService` — LLM analyzes pasted YouTube comments |
| **DTO** | `CommentsDto` (comments: string, niche?: string) |

#### Analysis Includes
- Summary
- Requested topics (with frequency)
- Unanswered questions
- Confusion points
- Pain points
- Video ideas ranked by **Subscriber Potential Score** (0-100)
- Sentiment
- **Audience profile** — one-sentence summary of what this audience values
- **Content gap alerts** — topics mentioned but not covered by creator

---

### H. Content-Gap Module (Opportunity Map)

| Aspect | Detail |
|---|---|
| **Controller** | `POST /api/content-gap` |
| **Service** | `ContentGapService` — LLM analyzes competitor content for gaps |
| **DTO** | `ContentGapDto` (urls?: string, topics?: string) |

#### Output Includes
- "Everyone covers" — saturated topics
- "Nobody covers" — untapped topics
- **Opportunities** — each with:
  - Opportunity score (0-100)
  - Difficulty (easy/medium/hard)
  - Timeline suggestion (this week / this month / this quarter)
  - First-mover advantage flag

---

### I. Repurpose Module (Content Atomizer)

| Aspect | Detail |
|---|---|
| **Controller** | `POST /api/repurpose` |
| **Service** | `RepurposeService` — LLM adapts YouTube title for 4 platforms |
| **DTO** | `RepurposeDto` (title: string, niche?: string) |

#### Platforms Covered (sorted by viral potential)
1. **TikTok** — short, punchy, trend-aware
2. **Instagram** — visual-first, storytelling
3. **X (Twitter)** — ultra-concise, strong opinion
4. **LinkedIn** — professional, value-driven

Each platform post includes: adapted title, caption, hashtags, tips, **Viral Potential Index** (0-100), **Best Posting Time**.

---

### J. Dashboard Module (Growth Command Center)

| Aspect | Detail |
|---|---|
| **Controller** | `GET /api/dashboard` (authenticated) |
| **Service** | `DashboardService` — aggregates data from ALL feature tables |

#### Dashboard Data Shape
```typescript
{
  // Summary stats
  totalGenerations: number;
  totalBattles: number;
  totalCommentAnalyses: number;
  averageViralityScore: number;
  bestViralityScore: number;
  streak: number;              // consecutive active days
  lastActiveDate: string | null;

  // Trends
  scoreTrend: { direction: 'up' | 'down' | 'flat', percentChange: number, slope: number };
  weeklyAverages: { week: string, avgScore: number }[];

  // Pattern intelligence
  mostUsedPattern: string;
  bestPerformingPattern: string;
  patternStats: { pattern: string, count: number, avgScore: number }[];

  // Dimension analysis
  weakestDimension: { name: string, avgScore: number };
  strongestDimension: { name: string, avgScore: number };

  // Cross-feature intelligence
  crossFeatureInsights: string[];   // connections between features

  // Recent activity (last 10 items across all features)
  recentActivity: ActivityItem[];

  // Suggested next actions
  quickActions: QuickAction[];
}
```

---

### K. Usage Module

| Aspect | Detail |
|---|---|
| **Controller** | `GET /api/usage` (returns usage stats for authenticated user) |
| **Service** | UsageService — queries `daily_usage` table |

#### Rate Limits
- **Authenticated users**: 3 generations per day (free) / 100 per day (Pro)
- **Guest users**: 3 generations total (tracked by IP address via in-memory Map)

---

## 6. Frontend Pages (Next.js)

| Route | Page Component | Feature | API Calls |
|---|---|---|---|
| `/` | `page.tsx` | Landing page | None |
| `/login` | `(auth)/login/page.tsx` | Sign in | `POST /api/auth/login` |
| `/signup` | `(auth)/signup/page.tsx` | Register | `POST /api/auth/register` |
| `/logout` | `(auth)/logout/page.tsx` | Sign out | Client-side Supabase signOut |
| `/generate` | `generate/page.tsx` | Title DNA Analyzer | `POST /api/analyze`, `GET /api/usage` |
| `/battle` | `battle/page.tsx` | Title Battle | `POST /api/battle` |
| `/hook` | `hook/page.tsx` | Hook Builder | `POST /api/hook` |
| `/validate` | `validate/page.tsx` | Idea Validator | `POST /api/validate` |
| `/readiness` | `readiness/page.tsx` | Readiness Score | `POST /api/readiness` |
| `/comments` | `comments/page.tsx` | Comment Intelligence | `POST /api/comments` |
| `/content-gap` | `content-gap/page.tsx` | Content Gap Finder | `POST /api/content-gap` |
| `/repurpose` | `repurpose/page.tsx` | Cross-Platform Repurposer | `POST /api/repurpose` |
| `/dashboard` | `dashboard/page.tsx` | Growth Command Center | `GET /api/dashboard` |

### Frontend Changes Summary

1. **`next.config.ts`** — Add `rewrites()` proxy rule:
   ```typescript
   async rewrites() {
     return [
       {
         source: '/api/:path*',
         destination: 'http://localhost:4000/api/:path*',
       },
     ];
   }
   ```

2. **Delete** `src/app/api/` directory entirely (all 12 route files moved to NestJS)

3. **Keep** `src/lib/supabase/client.ts` for browser-side Supabase auth (login/signup)

4. **Delete** `src/lib/supabase/server.ts` — auth is now via JWT tokens from NestJS

5. **Keep** `src/lib/analyzer-engine.ts` and `src/lib/data/power-words.ts` — frontend can optionally reuse for optimistic UI

6. **Delete** `src/lib/gemini.ts`, `src/lib/dashboard-service.ts`, `src/lib/user-profile.ts` — all migrated to NestJS

7. **Update** all page components to point fetch calls at NestJS endpoints (via proxy, same `/api/*` URLs)

---

## 7. API Routes — NestJS Endpoints

| Method | Endpoint | Auth Required | Module | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | Auth | Register new user |
| POST | `/api/auth/login` | No | Auth | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Auth | Get current user profile |
| POST | `/api/analyze` | No* | Analyze | Analyze a YouTube title |
| POST | `/api/battle` | No* | Battle | Compare two titles |
| POST | `/api/hook` | No* | Hook | Generate hook scripts |
| POST | `/api/validate` | No* | Validate | Validate a video idea |
| POST | `/api/readiness` | No* | Readiness | Score upload readiness |
| POST | `/api/comments` | No* | Comments | Analyze comments |
| POST | `/api/content-gap` | No* | Content-Gap | Find content gaps |
| POST | `/api/repurpose` | No* | Repurpose | Repurpose for platforms |
| GET | `/api/dashboard` | Yes | Dashboard | Aggregated dashboard data |
| GET | `/api/usage` | Yes | Usage | Daily usage stats |

> `*` No auth required, but if a JWT token is present, the endpoint will:
> - Save results to the user's history
> - Rate-limit based on authenticated limits (3/day free, 100/day Pro) vs guest limits (3 total)
> - Attach personal user context to enrich responses

---

## 8. Data Flow & Multi-Pass Pipeline

### The Complete Analysis Pipeline

```
User submits title
       │
       ▼
┌─────────────────────────┐
│ Layer 1: Pre-Analysis   │
│ AnalyzerEngine          │
│ • Real metrics          │
│ • Power words           │
│ • Pattern detection     │
│ • Readability           │
│ • Computed score        │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Layer 2: User Context   │
│ UserProfileService      │
│ • Personal averages     │
│ • Best/worst dimensions │
│ • Recent titles         │
│ • Niche                 │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Layer 3: LLM Enrichment │
│ GroqService             │
│ • Fed real metrics      │
│ • Deep psychology       │
│ • Audience analysis     │
│ • Suggestions           │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Layer 4: Post-Process   │
│ • Merge computed + LLM  │
│ • Compare vs personal   │
│ • Cross-ref other data  │
│ • Generate next action  │
└─────────┬───────────────┘
          │
          ▼
    Return JSON Response
```

### Cross-Feature Data Flow

```
                   ┌───────────────────┐
                   │  Dashboard        │
                   │  (Aggregator)     │
                   └────────┬──────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Title        │   │ Comment      │   │ Content Gap  │
│ Analyzer     │◄──│ Intelligence │   │ Finder       │
│              │   │              │   │              │
│ Reads from:  │   │ Feeds into:  │   │ Reads from:  │
│ • Comments   │   │ • Dashboard  │   │ • Comments   │
│ • User hist  │   │ • Gap Finder │   │ • User hist  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Title Battle │   │ Hook Lab     │   │ Launch Cmd   │
│              │   │              │   │              │
│ Saves to DB  │   │ Saves to DB  │   │ Saves to DB  │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 9. Development Roadmap

### Phase 1: Foundation (Week 1)
**Goal: Monorepo scaffolded, NestJS running, database connected.**

| Step | Task |
|---|---|
| 1.1 | Set up npm workspaces in root `package.json` |
| 1.2 | Move existing Next.js code into `packages/frontend/` |
| 1.3 | Scaffold NestJS app in `packages/backend/` |
| 1.4 | Create `docker-compose.yml` with PostgreSQL |
| 1.5 | Convert Supabase SQL migrations to Prisma schema |
| 1.6 | Run `prisma migrate dev` — all tables created |
| 1.7 | Set up Auth module (register, login, JWT) |
| 1.8 | Set up PrismaModule + PrismaService |
| 1.9 | Add CORS config in NestJS main.ts |
| 1.10 | Add API proxy in Next.js `next.config.ts` |

### Phase 2: Analyze Module (Week 2)
**Goal: Title DNA Analyzer fully functional via NestJS.**

| Step | Task |
|---|---|
| 2.1 | Migrate `analyzer-engine.ts` to NestJS (pure functions) |
| 2.2 | Migrate `power-words.ts` to NestJS |
| 2.3 | Create GroqService for LLM calls |
| 2.4 | Build AnalyzeModule (controller, service, DTO) |
| 2.5 | Implement multi-pass pipeline in service |
| 2.6 | Add rate limiting (guest + authenticated) |
| 2.7 | Update frontend generate page to call NestJS via proxy |
| 2.8 | Test end-to-end: frontend → proxy → NestJS → DB |

### Phase 3: Core Feature Modules (Week 3)
**Goal: All 8 analysis features migrated.**

| Step | Task |
|---|---|
| 3.1 | Battle Module (migrate battle route + LLM prompt) |
| 3.2 | Hook Module |
| 3.3 | Validate Module |
| 3.4 | Readiness Module |
| 3.5 | Comments Module |
| 3.6 | Content-Gap Module |
| 3.7 | Repurpose Module |
| 3.8 | Update all frontend pages to use new API endpoints |

### Phase 4: Dashboard & Usage (Week 4)
**Goal: Dashboard aggregates all features; usage tracking works.**

| Step | Task |
|---|---|
| 4.1 | Migrate DashboardService to NestJS |
| 4.2 | Build DashboardModule (controller, service) |
| 4.3 | Implement cross-feature insight generation |
| 4.4 | Build UsageModule (controller, service) |
| 4.5 | Update frontend dashboard page |
| 4.6 | Add daily streak computation |
| 4.7 | Add trend computation (linear regression for slope) |

### Phase 5: Polish & Testing (Week 5)
**Goal: Production-ready with tests and docs.**

| Step | Task |
|---|---|
| 5.1 | Write unit tests for AnalyzerEngine (all pure functions) |
| 5.2 | Write e2e tests for Auth endpoints |
| 5.3 | Write e2e tests for Analyze endpoint |
| 5.4 | Add Swagger/OpenAPI docs |
| 5.5 | Error handling & validation improvements |
| 5.6 | Remove Supabase server dependency from frontend |
| 5.7 | Final integration testing |

---

> **Note:** Existing Supabase auth (login/signup pages) uses the Supabase browser client. In Phase 5, we can replace this with the NestJS JWT auth flow for a fully self-contained backend. Until then, the frontend uses Supabase for login/signup and stores the JWT from NestJS after login.
