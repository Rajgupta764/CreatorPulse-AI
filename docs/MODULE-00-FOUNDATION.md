# Module 00 — Foundation Setup

> **Goal:** Scaffold the monorepo, set up Docker + PostgreSQL, initialize NestJS backend and Next.js frontend, configure Prisma with all database models, and establish the shared infrastructure.

---

## Step 1 — Root Monorepo

### 1.1 Root `package.json`

```json
{
  "name": "creatorpulse-ai",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run start:dev --workspace packages/backend",
    "dev:frontend": "npm run dev --workspace packages/frontend",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "npm run build --workspace packages/backend",
    "build:frontend": "npm run build --workspace packages/frontend",
    "db:migrate": "npm run prisma:migrate --workspace packages/backend",
    "db:generate": "npm run prisma:generate --workspace packages/backend",
    "db:studio": "npm run prisma:studio --workspace packages/backend",
    "lint": "npm run lint --workspace packages/frontend",
    "test": "npm run test --workspace packages/backend"
  },
  "devDependencies": {
    "concurrently": "^9.1.0"
  }
}
```

### 1.2 Root `.gitignore`

```
node_modules/
dist/
.next/
.env
.env.local
*.tsbuildinfo
next-env.d.ts
```

### 1.3 Run `npm install` at root

```bash
npm install
```

---

## Step 2 — Docker Compose (PostgreSQL)

### `docker-compose.yml` (project root)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: creatorpulse-db
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: creatorpulse
      POSTGRES_PASSWORD: creatorpulse
      POSTGRES_DB: creatorpulse
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Start Database

```bash
docker compose up -d
```

Verify:
```bash
docker ps                    # container should be running
psql -h localhost -U creatorpulse -d creatorpulse -c "\l"   # lists databases
```

---

## Step 3 — Frontend (Next.js) Migration

### 3.1 Move Existing Files

Create `packages/frontend/` and move these into it:

```
packages/frontend/
├── src/             # full src/ directory
├── public/          # static assets
├── next.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json
└── next-env.d.ts
```

### 3.2 Update `packages/frontend/package.json`

```json
{
  "name": "@creatorpulse/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": { /* keep all existing deps */ },
  "devDependencies": { /* keep all existing devDeps */ }
}
```

### 3.3 Update `packages/frontend/tsconfig.json`

Add this path alias if not already present:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3.4 Update `packages/frontend/next.config.ts` — Add API Proxy

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
```

### 3.5 Files to DELETE from Frontend

After migration, delete these — their logic moves to the NestJS backend:

```
src/app/api/                          # entire directory (12 route files)
src/lib/gemini.ts                     # LLM calls → GroqService
src/lib/dashboard-service.ts          # Dashboard aggregation → DashboardService
src/lib/user-profile.ts               # User queries → AuthService/UserProfileService
src/lib/supabase/server.ts            # Server auth → JWT in NestJS
src/lib/supabase/middleware.ts        # Supabase middleware → JWT guard
```

### 3.6 Files to KEEP in Frontend

```
src/lib/supabase/client.ts            # Browser-side Supabase client (login/signup only)
src/lib/analyzer-engine.ts            # Optional: pre-analysis for optimistic UI
src/lib/data/power-words.ts           # Power word dictionary
src/lib/utils.ts                      # cn() utility
src/types/index.ts                    # Shared type definitions
src/components/                       # All UI components
src/app/(auth)/                       # Login, signup, logout pages
src/app/<feature>/                    # All feature pages
src/hooks/                            # Custom hooks
```

---

## Step 4 — Backend (NestJS) Scaffolding

### 4.1 Scaffold NestJS

```bash
cd packages
npx @nestjs/cli new backend --package-manager npm --skip-git
cd backend
```

### 4.2 Install Production Dependencies

```bash
npm install @nestjs/jwt @nestjs/passport @nestjs/swagger
npm install passport passport-jwt
npm install @prisma/client
npm install bcrypt
npm install class-validator class-transformer
npm install openai
npm install reflect-metadata rxjs
```

### 4.3 Install Dev Dependencies

```bash
npm install -D prisma @types/bcrypt @types/passport-jwt @types/express
npm install -D @nestjs/testing ts-jest jest ts-node
```

### 4.4 Create `packages/backend/.env`

```
DATABASE_URL="postgresql://creatorpulse:creatorpulse@localhost:5432/creatorpulse"
JWT_SECRET="change-this-to-a-random-64-char-string"
JWT_EXPIRATION="7d"
GROQ_API_KEY="gsk_your_groq_api_key_here"
PORT=4000
```

### 4.5 Update `packages/backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 4.6 NestJS App Bootstrap (`packages/backend/src/main.ts`)

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle("CreatorPulse AI API")
    .setDescription("Research Intelligence for YouTube Creators")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
```

### 4.7 Root Module (`packages/backend/src/app.module.ts`)

```typescript
import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
})
export class AppModule {}
```

---

## Step 5 — Prisma Setup

### 5.1 Initialize Prisma

```bash
cd packages/backend
npx prisma init
```

Replace the generated `prisma/schema.prisma` with the full schema below.

### 5.2 Prisma Schema (`packages/backend/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

model Generation {
  id                   String   @id @default(uuid()) @db.Uuid
  userId               String   @map("user_id") @db.Uuid
  inputTitle           String   @map("input_title")
  niche                String?
  analysis             Json
  generatedTitles      Json     @map("generated_titles")
  generatedDescription Json     @map("generated_description")
  createdAt            DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@map("generations")
}

model DailyUsage {
  id     String   @id @default(uuid()) @db.Uuid
  userId String   @map("user_id") @db.Uuid
  date   DateTime @db.Date
  count  Int      @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@map("daily_usage")
}

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

### 5.3 Run Migration

```bash
cd packages/backend
npx prisma migrate dev --name init
```

### 5.4 Generate Prisma Client

```bash
npx prisma generate
```

---

## Step 6 — Prisma Module (NestJS)

### `packages/backend/src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### `packages/backend/src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## Step 7 — Groq Service (LLM)

### `packages/backend/src/common/groq.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class GroqService {
  private client: OpenAI;
  private readonly model = "llama-3.3-70b-versatile";

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  async call(prompt: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 4096,
    });
    const content = res.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from Groq");
    return content;
  }

  extractJson(text: string): string {
    const cleaned = text.replace(/```[\w]*\n?/g, "").trim();
    let braceCount = 0;
    let start = -1;
    let inString = false;
    let prevChar = "";
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (ch === '"' && prevChar !== "\\") inString = !inString;
      if (!inString) {
        if (ch === "{") { if (start === -1) start = i; braceCount++; }
        else if (ch === "}") { braceCount--; if (braceCount === 0 && start !== -1) return cleaned.slice(start, i + 1); }
      }
      prevChar = ch;
    }
    throw new Error("No valid JSON found in response");
  }

  safeParse(raw: string) {
    try { return JSON.parse(raw); }
    catch {
      const repaired = raw.replace(/\\(?!["\\/bfnrtu])/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
      return JSON.parse(repaired);
    }
  }
}
```

### `packages/backend/src/common/common.module.ts`

```typescript
import { Global, Module } from "@nestjs/common";
import { GroqService } from "./groq.service";

@Global()
@Module({
  providers: [GroqService],
  exports: [GroqService],
})
export class CommonModule {}
```

---

## Step 8 — Analyzer Engine (Pure Functions, shared with Auth)

### `packages/backend/src/common/engine/analyzer-engine.ts`

Copy the entire content from the existing `src/lib/analyzer-engine.ts` — it contains pure functions that are deterministic and reusable across modules:

- `computeRealMetrics(title)` — character count, word count, hasNumber, etc.
- `detectPowerWords(title, POWER_WORDS)` — matches against dictionary
- `detectPatterns(title, metrics)` — regex-based pattern detection
- `computeReadability(title)` — Flesch-Kincaid based heuristic
- `computeViralityScore(metrics, powerWords, patterns, readabilityScore)` — 0-100
- `runPreAnalysis(title)` — runs all of the above and returns PreAnalysisResult

### `packages/backend/src/common/engine/power-words.ts`

Copy the existing `src/lib/data/power-words.ts` — the dictionary of ~130 power words.

### `packages/backend/src/common/engine/index.ts`

```typescript
export * from "./analyzer-engine";
export * from "./power-words";
```

---

## Step 9 — Theme Migration

### 9.1 Replace `packages/frontend/src/app/globals.css`

Replace the entire `:root` block with the light theme from `THEME-OF-THE-WEBSITE.md`.

### 9.2 Update `packages/frontend/src/app/layout.tsx`

Remove any dark-mode specific code. The layout should use the light theme fonts and body background.

---

## Step 10 — Verify

### 10.1 Start Everything

```bash
# Terminal 1 — Database
docker compose up

# Terminal 2 — Backend
cd packages/backend
npm run start:dev

# Terminal 3 — Frontend
cd packages/frontend
npm run dev
```

### 10.2 Check

```bash
curl http://localhost:4000/api/docs    # Swagger UI loads
curl http://localhost:3000              # Next.js app loads, API proxy routes to NestJS
```

### 10.3 Prisma Studio (optional, for inspection)

```bash
cd packages/backend
npx prisma studio
```

---

## Acceptance Criteria

- [ ] `docker compose up` starts PostgreSQL on port 5432
- [ ] `npm run dev` starts both NestJS (4000) and Next.js (3000)
- [ ] Swagger UI accessible at `http://localhost:4000/api/docs`
- [ ] Next.js app loads at `http://localhost:3000` without errors
- [ ] Frontend `fetch("/api/health")` proxies to NestJS backend (add a simple `@Get('health')` to test)
- [ ] `npx prisma db push` creates all 8 tables in PostgreSQL
- [ ] Prisma Client generates without errors
- [ ] Frontend compiles without server-side API errors (no `src/app/api/` files remaining)
- [ ] `globals.css` uses the white/light theme variables
