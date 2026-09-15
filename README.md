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
| LLM | Groq API (llama-3.3-70b-versatile) |
| Payments | Lemon Squeezy |

## Quickstart

Prerequisites: Node 20+, Docker.

```bash
# 1. Install all workspace dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Configure environment
#   copy packages/backend/.env.example → packages/backend/.env
#   copy packages/frontend/.env.example → packages/frontend/.env.local
#   (fill in DATABASE_URL, JWT_SECRET, GROQ_API_KEY, etc.)

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
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:studio` | Prisma Studio |
| `npm run lint` | Frontend ESLint |

## Environment Variables

**Backend (`packages/backend/.env`)**
```
DATABASE_URL=postgresql://creatorpulse:creatorpulse@localhost:5432/creatorpulse
JWT_SECRET=change-me-64-char-random
JWT_EXPIRATION=7d
GROQ_API_KEY=gsk_...
PORT=4000
# Billing keys here
```

**Frontend (`packages/frontend/.env.local`)**
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Rate Limits

| User | Limit |
|---|---|
| Guest (per IP, 24h window) | 3 analyses total |
| Free account | 3 analyses/day |
| Pro account | 100 analyses/day |

## Modules

Each backend feature lives in `packages/backend/src/<module>/` with a controller, service, and DTO. Detailed specs are in `docs/` (`MODULE-*.md`).

## Docker

To start the database:
```bash
docker start creatorpulse-db
```

To stop the docker :- docker compose up -d
To delete the docker file :- docker rm viralforge-db
To start the docker with the new name :- docker compose up -d
