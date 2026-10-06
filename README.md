# CreatorPulse AI

Research Intelligence Platform for YouTube creators. Analyze titles, battle options, generate hooks, validate ideas, score upload readiness, mine audience comments, find content gaps, and repurpose across platforms — anchored in real metrics, not generic AI guesses.

## Monorepo Structure

```
creatorpulse-ai/
├── packages/
│   ├── backend/      # NestJS API (all feature modules, billing, history)
│   ├── frontend/     # Next.js 16 App Router (all tool pages + landing)
│   └── shared/       # Shared types (future)
├── docs/             # Feature planning, tech stack, per-module specs
├── docker-compose.yml # PostgreSQL 16 (local dev)
└── package.json      # npm workspaces
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, Prisma 6, PostgreSQL 16 |
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Auth | Custom JWT (bcryptjs + jsonwebtoken) |
| LLM | Groq API (`openai/gpt-oss-20b`) |
| Payments | Lemon Squeezy |

## Quickstart

Prerequisites: Node 20+, Docker.

```bash
# 1. Install all workspace dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Configure environment
#   create packages/backend/.env and packages/frontend/.env.local
#   (required vars are listed under "Environment Variables" below)

# 4. Run migrations + generate Prisma client
npm run db:migrate
npm run db:generate

# 5. Start both services
npm run dev
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:4000  (Swagger at /api/docs)
```

## Common Scripts

| Script | Description |
|---|---|
| `npm run dev` | Run backend + frontend concurrently |
| `npm run build` | Build backend + frontend |
| `npm run test` | Backend unit tests (Jest) |
| `npm run db:migrate` | Prisma migrate dev (local) |
| `npm run db:deploy` | Prisma migrate deploy (production) |
| `npm run db:studio` | Prisma Studio |
| `npm run lint` | Frontend ESLint |

## Environment Variables

**Backend (`packages/backend/.env`)**
```
DATABASE_URL=postgresql://creatorpulse:creatorpulse@localhost:5433/creatorpulse
JWT_SECRET=change-me-64-char-random
JWT_EXPIRATION=7d
GROQ_API_KEY=gsk_...
PORT=4000
# Comma-separated list of allowed browser origins
CORS_ORIGINS=http://localhost:3000
# Set to true when running behind a reverse proxy (correct client IPs for guest quota)
TRUST_PROXY=false
# Kill switch: set to false to return 503 AI_DISABLED on every AI route
AI_ENABLED=true
# Expose Swagger at /api/docs (never true in production)
SWAGGER_ENABLED=true
# Optional: shared rate-limit + guest-quota store (see Docker below).
# Leave unset to run those counters in-process.
REDIS_URL=redis://localhost:6379

# --- Lemon Squeezy (billing) ---
# API key: LS Dashboard → Settings → API → Create API key (starts with "eyJ...")
LEMON_SQUEEZY_API_KEY=
# Store id: LS Dashboard → Settings → Stores (numeric)
LEMON_SQUEEZY_STORE_ID=
# Variant id of the Pro plan: LS Dashboard → Products → your product → Pricing (numeric)
LEMON_SQUEEZY_VARIANT_ID=
# Must match the signing secret shown when creating the webhook below (6-40 chars)
LEMON_SQUEEZY_WEBHOOK_SECRET=
# Where Lemon Squeezy sends the customer back after checkout
SITE_URL=http://localhost:3000
```

### Lemon Squeezy webhook setup

1. **LS Dashboard → Settings → Webhooks → Add webhook**
2. **Callback URL:** `https://YOUR-DOMAIN/api/billing/webhook`
   - Local dev: Lemon Squeezy cannot reach `localhost`. Run `ngrok http 4000`
     (or `cloudflared tunnel --url http://localhost:4000`) and use the HTTPS URL it gives you.
3. **Signing secret:** generate one and paste the **exact same value** into
   `LEMON_SQUEEZY_WEBHOOK_SECRET` in `packages/backend/.env` (it is only shown once).
4. **Events:** tick `order_created`, `order_refunded`, `customer_updated`, and all
   `subscription_*` events (`created`, `updated`, `cancelled`, `resumed`, `paused`,
   `unpaused`, `expired`, `plan_changed`, `payment_failed`, `payment_success`,
   `payment_recovered`, `payment_refunded`).
5. Restart the backend. Startup logs will warn about any billing env var that is
   still missing or still set to a placeholder (e.g. `your_variant_id`).

**Frontend (`packages/frontend/.env.local`)** — see `packages/frontend/.env.example`
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Origin of the backend WITHOUT /api (e.g. https://api.example.com).
# Unset in local dev to route /api/* through the next.config.ts rewrite.
NEXT_PUBLIC_API_URL=http://localhost:4000
# Server-side rewrite target for /api/* (defaults to http://localhost:4000)
API_PROXY_URL=http://localhost:4000
```

## Rate Limits

Single source of truth: `packages/shared/src/limits.ts` (`npm run build:shared` to rebuild).

| User | Limit |
|---|---|
| Guest (per IP, per day) | 3 AI analyses, shared across all AI endpoints |
| Free account | 3 credits/day |
| Pro account | 100 credits/day (marketed as unlimited) |

The `users.daily_limit` column exists for admin overrides; runtime enforcement reads the shared config.

**HTTP rate limits** (NestJS Throttler, `packages/backend/src/common/config/limits.ts`):

| Route class | Limit |
|---|---|
| Default (auth, billing, usage) | 120 req/min |
| AI endpoints | 30 req/min |
| `POST /api/auth/register` | 5 per 10 min |
| `POST /api/auth/login` | 10 per 10 min |

Limits are ×1000 in `NODE_ENV=test` so suites are not throttled. Set `AI_ENABLED=false` to turn every AI route into a 503 `AI_DISABLED` (kill switch).

## Modules

Each backend feature lives in `packages/backend/src/<module>/` with a controller, service, and DTO. Detailed specs are in `docs/` (`MODULE-*.md`).

## Docker

One compose file lives at the repo root (`docker-compose.yml`): Postgres in `creatorpulse-db` on port **5433** and Redis in `creatorpulse-redis` on port **6379**.

```bash
docker compose up -d      # create / start the database and Redis
docker stop creatorpulse-db
docker start creatorpulse-db
docker compose down       # stop and remove the containers (volumes are kept)
docker compose down -v    # remove the containers AND drop all data
```

Data lives in the `postgres_data` and `redis_data` volumes, so `down` / `up` never loses it.

### Redis

`REDIS_URL` is optional. When it is set, HTTP rate limiting and the guest
per-IP credit quota are stored in Redis, so every backend instance shares the
same counters. When it is unset (or Redis is unreachable) the backend logs a
warning and falls back to in-process counters — nothing breaks, the limits are
just not shared across processes.

## Deployment (free tier)

Zero-cost stack, no credit card, platform URLs:

| Piece | Host | Config |
|---|---|---|
| Frontend | Netlify (free) | `netlify.toml` |
| Backend | Render free web service | `render.yaml` (Blueprint) |
| Database | Neon free Postgres (0.5 GB, no expiry) | `DATABASE_URL` |
| Keep-alive + monitoring | UptimeRobot (5-min ping to `/api/health`) | — |

Production env checklist:

1. **Backend (Render env vars):** `NODE_ENV=production`, `TRUST_PROXY=true`, `SWAGGER_ENABLED=false`, `CORS_ORIGINS=https://<site>.netlify.app`, `SITE_URL=https://<site>.netlify.app`, plus all secrets (`sync: false` entries in `render.yaml`).
2. **Frontend (Netlify env vars, set *before* first build — `NEXT_PUBLIC_*` are inlined at build time):** `NEXT_PUBLIC_API_URL=https://<api>.onrender.com` (origin, no `/api`), `NEXT_PUBLIC_SITE_URL=https://<site>.netlify.app`, `API_PROXY_URL=https://<api>.onrender.com`.
3. **Migrations** run automatically on backend start (`prisma migrate deploy` in `render.yaml`).
4. **Lemon Squeezy webhook:** `https://<api>.onrender.com/api/billing/webhook` (see setup above).

The browser calls the API directly on its own origin (cross-origin), so real client IPs reach the backend and the guest per-IP quota works. `GET /api/health` returns `503` when the database is unreachable.

