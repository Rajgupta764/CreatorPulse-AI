# CreatorPulse AI — Tech Stack & Engineering Setup

> This document defines the exact technology choices, versions, and setup instructions for engineers building CreatorPulse AI from scratch.

---

## Core Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Backend Framework** | NestJS | ^11.x | Modular Node.js backend with dependency injection, guards, interceptors |
| **Frontend Framework** | Next.js | 16.2.x | React framework with App Router, SSR, and API proxy |
| **Language** | TypeScript | ^5.x | Type safety across both layers |
| **Database** | PostgreSQL | 16 (Docker) | Primary relational data store |
| **ORM** | Prisma | ^6.x | Type-safe database client, migrations, schema generation |
| **Auth** | Custom JWT | — | bcrypt + jsonwebtoken for user authentication |
| **LLM Provider** | Groq API | — | llama-3.3-70b-versatile model via OpenAI SDK |
| **UI Framework** | React | 19.x | Component library |
| **Styling** | Tailwind CSS | ^4.x | Utility-first CSS |
| **UI Component Library** | shadcn/ui (base-nova) | latest | Pre-built accessible components |
| **Icons** | lucide-react | ^1.18.x | Icon library |

---

## Backend (NestJS) — `packages/backend/`

### Dependencies

**Production:**
| Package | Purpose |
|---|---|
| `@nestjs/core` | NestJS framework core |
| `@nestjs/common` | Decorators, guards, pipes, interceptors |
| `@nestjs/platform-express` | Express adapter |
| `@nestjs/jwt` | JWT token generation & validation |
| `@nestjs/passport` | Passport integration for auth strategies |
| `@nestjs/swagger` | OpenAPI/Swagger documentation |
| `passport` | Authentication middleware |
| `passport-jwt` | JWT strategy for Passport |
| `@prisma/client` | Generated type-safe database client |
| `bcrypt` | Password hashing |
| `class-validator` | DTO validation via decorators |
| `class-transformer` | Object transformation (used with class-validator) |
| `openai` | OpenAI SDK (for Groq API calls) |
| `reflect-metadata` | TypeScript decorator support |

**Dev Dependencies:**
| Package | Purpose |
|---|---|
| `typescript` | TypeScript compiler |
| `prisma` | Prisma CLI (migrations, generate, studio) |
| `@types/bcrypt` | Type definitions for bcrypt |
| `@types/passport-jwt` | Type definitions for passport-jwt |
| `@types/express` | Type definitions for express |
| `@nestjs/cli` | NestJS CLI for scaffolding |
| `@nestjs/testing` | NestJS testing utilities |
| `ts-jest` | Jest transformer for TypeScript |
| `jest` | Testing framework |
| `ts-node` | TypeScript execution for development |

### NestJS Project Setup

```bash
# Scaffold NestJS project
npx @nestjs/cli new packages/backend --package-manager npm --skip-git

# Navigate to backend
cd packages/backend

# Install production dependencies
npm install @nestjs/jwt @nestjs/passport @nestjs/swagger
npm install passport passport-jwt
npm install @prisma/client
npm install bcrypt
npm install class-validator class-transformer
npm install openai

# Install dev dependencies
npm install -D typescript prisma
npm install -D @types/bcrypt @types/passport-jwt
npm install -D @types/express
npm install -D @nestjs/testing ts-jest jest ts-node
```

### Project Configuration Files

**`nest-cli.json`:**
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": ["@nestjs/swagger"]
  }
}
```

**`tsconfig.json`:**
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

### Standard Module Structure

Every feature module follows this pattern:

```
src/<module-name>/
├── <module-name>.module.ts     # @Module({ imports, controllers, providers })
├── <module-name>.controller.ts # @Controller('/api/<route>')
├── <module-name>.service.ts    # Business logic
├── dto/
│   ├── <action>.dto.ts         # class-validator decorated DTOs
│   └── index.ts                # Barrel export
├── interfaces/                 # Feature-specific interfaces (optional)
└── __tests__/                  # Unit tests
```

Example controller pattern:
```typescript
@Controller('api/analyze')
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async analyze(@Body() dto: AnalyzeDto) {
    return this.analyzeService.analyze(dto);
  }
}
```

### Prisma Setup

1. **Initialize Prisma:**
```bash
npx prisma init --datasource-provider postgresql
```

2. **Define schema** in `prisma/schema.prisma`

3. **Run migrations:**
```bash
npx prisma migrate dev --name init
```

4. **Generate client:**
```bash
npx prisma generate
```

5. **Create PrismaModule** (singleton service):
```typescript
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

---

## Frontend (Next.js) — `packages/frontend/`

### Dependencies

**Production:**
| Package | Purpose |
|---|---|
| `next` | React framework with App Router |
| `react` | UI library |
| `react-dom` | React DOM rendering |
| `@base-ui/react` | Base UI primitives (shadcn v4) |
| `@supabase/ssr` | Supabase browser client (for login/signup only) |
| `@supabase/supabase-js` | Supabase JavaScript client |
| `class-variance-authority` | Variant-based class management |
| `clsx` | Conditional class merging |
| `tailwind-merge` | Tailwind class conflict resolution |
| `tw-animate-css` | Tailwind animation plugin |
| `lucide-react` | Icon library |
| `html-to-image` | Screenshot export functionality |
| `shadcn` | shadcn/ui CLI |

**Dev Dependencies:**
| Package | Purpose |
|---|---|
| `typescript` | TypeScript compiler |
| `@types/node` | Node.js type definitions |
| `@types/react` | React type definitions |
| `@types/react-dom` | React DOM type definitions |
| `tailwindcss` | Tailwind CSS v4 |
| `@tailwindcss/postcss` | PostCSS plugin for Tailwind v4 |
| `eslint` | Linter |
| `eslint-config-next` | Next.js ESLint config |

### Key Frontend Configs

**`next.config.ts`** (with API proxy):
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

**`tsconfig.json`** (path aliases):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Frontend Migration — What to Remove

After moving existing code into `packages/frontend/`:

**DELETE these files** (logic moved to NestJS backend):
| File | Reason |
|---|---|
| `src/app/api/` (entire directory) | All API routes → NestJS controllers |
| `src/lib/supabase/server.ts` | Server auth → JWT in NestJS |
| `src/lib/gemini.ts` | LLM calls → NestJS GroqService |
| `src/lib/dashboard-service.ts` | Dashboard aggregation → NestJS DashboardService |
| `src/lib/user-profile.ts` | User queries → NestJS UserProfileService |

**KEEP these files** (frontend-only or browser-side):
| File | Reason |
|---|---|
| `src/lib/supabase/client.ts` | Browser-side Supabase client for login/signup |
| `src/lib/analyzer-engine.ts` | Optional: pre-analysis for optimistic UI |
| `src/lib/data/power-words.ts` | Power word dictionary (shared with backend) |
| `src/lib/utils.ts` | `cn()` utility for Tailwind |
| `src/types/index.ts` | Type definitions (shared contract) |
| `src/components/` (all) | UI components remain unchanged |
| `src/app/` (all pages) | Page components remain unchanged |
| `src/hooks/` | Custom hooks remain unchanged |

---

## Docker — `docker-compose.yml` (root)

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

### Environment Variables

**`packages/backend/.env`:**
```
DATABASE_URL="postgresql://creatorpulse:creatorpulse@localhost:5432/creatorpulse"
JWT_SECRET="your-jwt-secret-key-change-in-production"
JWT_EXPIRATION="7d"
GROQ_API_KEY="gsk_..."
PORT=4000
```

**`packages/frontend/.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_xxx"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

---

## Monorepo Root — `package.json`

```json
{
  "name": "creatorpulse-ai",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev:backend": "npm run start:dev --workspace packages/backend",
    "dev:frontend": "npm run dev --workspace packages/frontend",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "build:backend": "npm run build --workspace packages/backend",
    "build:frontend": "npm run build --workspace packages/frontend",
    "build": "npm run build:backend && npm run build:frontend",
    "db:migrate": "npm run prisma:migrate --workspace packages/backend",
    "db:generate": "npm run prisma:generate --workspace packages/backend",
    "db:studio": "npm run prisma:studio --workspace packages/backend",
    "lint": "npm run lint --workspace packages/frontend",
    "test": "npm run test --workspace packages/backend"
  },
  "devDependencies": {
    "concurrently": "^9.x"
  }
}
```

---

## Running the Project Locally

### First-time Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd viralforge

# 2. Install all workspace dependencies
npm install

# 3. Start PostgreSQL via Docker
docker compose up -d

# 4. Run database migrations (Prisma)
npm run db:migrate

# 5. Generate Prisma client
npm run db:generate

# 6. Copy environment files
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env.local

# 7. Start both services
npm run dev
```

### Daily Development

```bash
# Start both backend (port 4000) and frontend (port 3000)
npm run dev

# Or run individually:
npm run dev:backend   # NestJS on http://localhost:4000
npm run dev:frontend  # Next.js on http://localhost:3000

# View database in Prisma Studio
npm run db:studio

# Run backend tests
npm run test

# Create a new migration (after schema changes)
cd packages/backend
npx prisma migrate dev --name <migration-name>
```

---

## Code Conventions

### Backend (NestJS)

| Convention | Rule |
|---|---|
| **File naming** | `kebab-case` for all files: `analyze.service.ts`, `jwt-auth.guard.ts` |
| **Class naming** | PascalCase: `AnalyzeService`, `JwtAuthGuard` |
| **Method naming** | camelCase: `analyzeTitle()`, `getDashboardData()` |
| **DTOs** | Single class per file with `class-validator` decorators |
| **Validation** | Always use `ValidationPipe` with `{ transform: true }` |
| **Error handling** | Use NestJS exception filters; never catch errors in controllers |
| **Guards** | Use `@UseGuards(JwtAuthGuard)` for protected routes |
| **Module organization** | One module per feature, all modules in `AppModule` |
| **Database access** | Only through PrismaService (injected), never raw queries |
| **LLM calls** | Only through centralized `GroqService` (reusable across modules) |
| **Pure functions** | Engine functions (analyzer-engine.ts) are pure, stateless, deterministic |

### Frontend (Next.js)

| Convention | Rule |
|---|---|
| **Component naming** | PascalCase files: `DnaAnalyzer.tsx`, `TitleInput.tsx` |
| **API calls** | All via native `fetch()` to `/api/*` (proxied to NestJS) |
| **Types** | Keep shared types in `src/types/index.ts` |
| **Hooks** | Custom hooks in `src/hooks/` |
| **Components** | Feature components in `src/components/<feature>/` |
| **Pages** | Route pages in `src/app/<route>/page.tsx` |
| **No server-side API calls** | All API logic lives in NestJS; frontend only calls endpoints |

### Git Workflow

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/<module-name>` | Feature branches (e.g., `feature/analyze-module`) |

```
main → develop → feature/analyze-module
                → feature/battle-module
                → feature/dashboard
```

---

## LLM Integration (Groq)

All LLM prompts live in `packages/backend/src/common/groq.service.ts`.

### GroqService Pattern

```typescript
@Injectable()
export class GroqService {
  private readonly client: OpenAI;
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
}
```

### Prompt Design Rules

1. **Always feed real pre-computed data** — never ask the LLM to guess metrics it shouldn't
2. **Always request valid JSON** — include exact schema in the prompt
3. **Never contradict pre-computed data** — LLM must respect provided real metrics
4. **Temperature 0.8** — balances creativity with consistency
5. **Max tokens 4096** — sufficient for all current features

---

## Testing Strategy

### Backend Tests (Jest)

| Test Type | Location | Focus |
|---|---|---|
| **Unit tests** | `*.spec.ts` alongside source files | Pure functions (AnalyzerEngine), individual services |
| **Integration tests** | `test/*.e2e-spec.ts` | Controller + service + Prisma |
| **E2E tests** | `test/*.e2e-spec.ts` | Full request-response cycle |

### Key Test Files to Create

```
packages/backend/src/analyze/engine/
├── analyzer-engine.spec.ts     # Tests for all 5 pure functions
├── power-words.spec.ts          # Tests for power word detection
packages/backend/src/auth/
├── auth.service.spec.ts         # Tests for register/login logic
packages/backend/test/
├── auth.e2e-spec.ts             # POST /api/auth/register, POST /api/auth/login
├── analyze.e2e-spec.ts          # POST /api/analyze
```

---

## Key Design Decisions & Rationale

| Decision | Rationale |
|---|---|
| **NestJS over Express** | Modular architecture (modules, providers, guards) maps 1:1 to features; built-in DI, validation pipes, OpenAPI support |
| **Prisma over TypeORM** | Type-safe queries, auto-generated client, intuitive schema, faster migrations |
| **JWT over Supabase Auth** | Self-contained backend; no external auth dependency; easier to test and deploy |
| **Docker PostgreSQL** | Consistent local dev environment; matches production setup |
| **Next.js as frontend only** | Keep all existing UI; API proxy avoids CORS and preserves same fetch paths |
| **Monorepo over separate repos** | Shared types, single version control, coordinated changes across backend/frontend |
| **Pure functions for analysis engine** | Deterministic, testable, fast (<1ms), no network calls; LLM only for enrichment |
