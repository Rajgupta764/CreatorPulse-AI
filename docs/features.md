# CreatorPulse AI — Feature List

Every feature currently implemented in the codebase, documented in depth.
Sources: `packages/backend/src/*`, `packages/frontend/src/*`, `docs/MODULE-*.md`.

> **Status legend:** ✅ Implemented and reachable · ⚠️ Implemented with gaps · 🚧 Documented as planned but not built

---

## 1. Product Overview

**CreatorPulse AI** (repo folder `viralforge`) is a **Research Intelligence Platform for YouTube creators** — a "Content Strategy OS" instead of a generic title generator.

| | |
|---|---|
| **Target user** | YouTube creators (100–100K subs) posting 1–2 videos/week who currently get generic ideas from ChatGPT |
| **North-star metric** | Daily Active Creators — users who touch ≥2 features per day |
| **Core claim** | Every score is anchored in real, deterministic metrics — not a free-form AI guess |
| **Stack** | NestJS 11 · Prisma 6 · PostgreSQL 16 · Next.js 16 (App Router) · React 19 · Tailwind v4 · JWT auth · Groq LLM · Lemon Squeezy |
| **Ports** | Frontend `:3000` → proxies `/api/*` to backend `:4000` (Swagger at `/api/docs`) |

### The Multi-Pass Pipeline (architectural principle behind every tool)

1. **Layer 1 — Pre-Analysis Engine:** pure TypeScript functions compute real metrics (length, patterns, power words, readability, virality score) in <1 ms with no network calls.
2. **Layer 2 — LLM Enrichment:** the Groq model is *given* those metrics and asked to explain/extend them — never to re-derive them.
3. **Layer 3 — Personal Context:** authenticated users get compared against their own history (personal average, best score, most-used pattern).
4. **Layer 4 — Cross-Feature Lookup:** data from other tools is pulled in (recent titles, niche inheritance, unified history, dashboard aggregation).

**Model in use:** `openai/gpt-oss-20b` via the OpenAI SDK pointed at Groq (`temperature 0.8`, `max_tokens 4096`) in `common/groq.service.ts`.
*(The README/docs still name `llama-3.3-70b-versatile` — the code is the source of truth.)*

---

## 2. Core Analysis Tools (8)

All eight tools follow the same contract: `POST /api/<tool>` with `OptionalJwtAuthGuard` — guests can use them, a JWT adds quota enforcement, history persistence, and personal context.

### 2.1 Title Analyzer — "Title DNA Analyzer" ✅

The flagship feature and the heaviest pipeline.

- **Route:** `/generate` · **API:** `POST /api/analyze` · **Alt API:** `POST /api/analyze/alternatives` (JWT required)
- **Input:** `title` (1–500 chars, required), `niche` (≤100 chars, optional, defaults to `"general"`)

**What it does, in order:**
1. Runs `runPreAnalysis(title)` → `characterCount`, `wordCount`, `hasNumber`, `hasQuestionMark`, `hasColon`, `hasExclamation`, `isComparison`, `isListicle`, `startsWithHowTo/Question/Number`, `capitalRatio`, `lengthFlag`, detected **patterns** (How-To, Number/Listicle, Comparison, Question, Colon, Exclamation, Direct Address, Bracket, Transformational, Contrast, Ultra-Short, Long-Form), matched **power words** (from a ~150-word curated dictionary), a 0–100 **readability score**, and a deterministic **computed virality score**.
2. For signed-in users, loads the last **50 generations** and derives `personalAverageVirality`, `personalBestVirality`, `mostUsedPattern`, `bestPerformingPattern` (≥2 uses), `totalAnalyses`.
3. LLM pass #1 — psychological analysis: `emotionalTriggers[]`, `hookType`, a 7-dimension psychology block (`curiosity`, `authority`, `novelty`, `emotion`, `conflict`, `specificity`, `urgency`), `targetAudience`, `ctrExplanation`, `whyItWorks`.
4. **The server overwrites the LLM's numbers with the engine's** — `characterCount`, `readabilityScore`, `patterns`, `powerWords`, `viralityScore`/`computedViralityScore` always come from Layer 1.
5. Computes `nextAction` ("Your Next Move") from the weakest psychology dimension.
6. Two **parallel** LLM calls (`Promise.allSettled`, each fault-tolerant):
   - **5 alternative titles** — same viral pattern, matched to the original character length, each with `pattern` + `whyWorks`.
   - **Video description** — hook paragraph, value body, 4–6 chapter timestamps, CTA, 5–8 hashtags.
7. Persists to `generations` and increments the daily counter (authenticated only).

**UI:** virality score card with personal average, pattern + power-word chips, 7 animated psychology bars, playbook card with two actions — *Test in Title Battle* (prefills `/battle?prefill=`) and *Generate 3 Alternatives*.

**Known gaps ⚠️:** guest IP quota is `GUEST_LIMIT = 10` in code but the 429 message says "3 generations"; `titles[]` and `description` are returned by the API but not rendered on the page; `/analyze/alternatives` costs an LLM call without checking usage.

---

### 2.2 Title Battle — "Title Fusion Lab" ✅

- **Route:** `/battle` · **API:** `POST /api/battle` (guests allowed, no guest quota)
- **Input:** `titleA`, `titleB` (1–500 chars each); `?prefill=` fills Title A from the Analyzer.

Both titles get full deterministic pre-analysis, then one LLM call returns: **winner** (title, 0–100 score, reason, 3 strengths, 2 weaknesses, score explanation), **loser** (mirror), a 2–3 sentence **summary**, and a **hybrid title** fusing the best of both. Authenticated results are saved to `battles` (winner/loser scores) and counted against the daily quota.

**UI:** Winner card with score + reason, Hybrid Suggestion card, staged loading phases ("Weighing title A… Declaring the winner… Fusing hybrid suggestion…").

**Known gaps ⚠️:** `loser`, `summary`, and strengths/weaknesses are returned but not rendered; the response leaks internal fields `_preA`/`_preB`.

---

### 2.3 Hook Lab ✅

- **Route:** `/hook` · **API:** `POST /api/hook`
- **Input:** `title` (≤500), `niche?` (≤100)

Generates **three 30-second opening hook scripts** in distinct styles — **question**, **bold statement**, **storytelling** — each 60–90 words (~30 s spoken), tone matched to the niche, all ending with a transition into the main content. Per hook: `style`, `hook`, `tone`, `deliveryTip`, `estimatedDuration`. Saved to `hooks`.

**UI:** one card per hook with style badge, script, italic delivery tip, tone + duration.

---

### 2.4 Idea Incubator — "Validate" ✅

- **Route:** `/validate` · **API:** `POST /api/validate`
- **Input:** `idea` (≤1000 chars), `niche?` (≤100)

Scores a raw video idea across **six 0–100 dimensions** — Competition, Demand, Virality, Difficulty, Content Gap, Opportunity — each with a one-sentence explanation, plus an `overallScore` and a `recommendation`. **If the overall score is below 70**, the model must return an `evolution` block: `evolvedIdea`, `estimatedNewScore`, `explanation` — a rewritten idea expected to score higher. Saved to `validations`.

**UI:** overall score, six dimension cards, Evolved Idea card; guest notice — *"Results won't be saved. Sign in to track your history and unlock 3 analyses/day."*

**Known gap ⚠️:** `recommendation` is not rendered.

---

### 2.5 Launch Command — "Readiness" ✅

- **Route:** `/readiness` · **API:** `POST /api/readiness`
- **Input:** `title` (≤500, required), `description?` (≤5000), `hook?` (≤2000), `thumbnail?` (≤1000)

A pre-publish audit scoring four components 0–100 — **Title** (clickability, patterns, power words, length), **Description** (SEO, structure, hook, CTA, hashtags), **Hook** (attention, clarity, pacing), **Thumbnail** (text readability, contrast, emotion, focus) — with the **overall score as their average**. Returns `weakestArea`, `strongestArea`, `recommendation`, `finalAdvice`, a binary **`goNoGo: "go" | "no-go"`** verdict, and a 3–5 item **improvement checklist ordered by impact**. Saved to `readiness_scores` with the full input bundle.

**UI:** overall score + Go (green) / No-Go (red) badge, four sub-score cards, improvement checklist.

**Known gap ⚠️:** `weakestArea`, `strongestArea`, `recommendation`, `finalAdvice` are not rendered.

---

### 2.6 Audience Compass — "Comments" ✅

- **Route:** `/comments` · **API:** `POST /api/comments`
- **Input:** `comments` (10–10,000 chars, required), `niche?`

Mines pasted YouTube comments for **nine outputs**: summary · requested topics with `frequency` (common/several/few) · unanswered **questions** (with context) · **confusion** · **pain points** · **future video ideas** each ranked by a **Subscriber Potential Score (0–100**, where 80+ = "make this immediately") · **sentiment** (positive/mixed/negative/constructive) · **audience profile** · **content gap alerts**.

**Automatic context:** if signed-in with no niche given, it inherits the niche from your most recent generation and injects your last 5 video titles as context (top 3 echoed back in `_context`).

**UI:** summary card + video-idea list with big subscriber-potential numbers.

**Known gaps ⚠️:** topics, questions, confusion, pain points, sentiment, audience profile, and gap alerts are returned but not displayed; the response leaks `_context`.

---

### 2.7 Opportunity Map — "Content Gap" ✅

- **Route:** `/content-gap` · **API:** `POST /api/content-gap`
- **Input:** `urls?` (≤5000 chars), `topics?` (≤2000) — both optional free text

Compares competitor content against your niche and returns: **`everyoneCovers`** (saturated topics), **`nobodyCovers`** (untapped gaps), an **`opportunities[]`** list — each with `opportunity`, `rationale`, `opportunityScore` (0–100), `difficulty` (easy/medium/hard), `timeline` (this week/this month/this quarter), `firstMoverAdvantage` (bool) — plus a `contentGap` summary and a `recommendation`. Your niche is auto-inferred from your latest generation.

**UI:** saturated-topic chips (red), opportunity cards with score, rationale, difficulty/timeline chips, green "First Mover" badge.

**Known ⚠️:** `urls` is *not scraped* — it's pasted competitor text passed into the prompt; `nobodyCovers`, `contentGap`, `recommendation` are not rendered.

---

### 2.8 Content Atomizer — "Repurpose" ✅

- **Route:** `/repurpose` · **API:** `POST /api/repurpose`
- **Input:** `title` (≤500), `niche?`

Adapts one YouTube title into four platform-native posts — **TikTok** (hook in first 2 s, 1–3 line caption), **Instagram** (visual/storytelling, 2–4 sentences), **X** (<280 chars), **LinkedIn** (professional story + lesson, 3–6 sentences). Each post gets an adapted `title`, `caption`, 3–5 `hashtags`, 1–2 `tips`, a **viral potential index (0–100)**, and a `bestPostingTime`. **Platforms are sorted by viral potential, highest first.** Saved to `repurposes`.

**UI:** per-platform cards with VPI, caption, hashtag chips, tips, best time; guest save notice.

**Known gap ⚠️:** no copy/share/download button for generated posts.

---

## 3. Platform Features

### 3.1 Authentication ✅

Email/password with **bcrypt (12 rounds)** and **stateless JWT** (default expiry `7d`, payload `{ sub, email }`).

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/register` | Create account (password 8–128 chars, optional display name 2–50) |
| `POST /api/auth/login` | Sign in, returns `access_token` + user profile |
| `GET /api/auth/me` | Current profile incl. `tier` and `dailyLimit` |

- Duplicate email → `409 "Email already registered"`; wrong email/password → identical `401` (no user enumeration).
- **Client:** token in `localStorage("access_token")`; `apiFetch()` auto-attaches `Authorization: Bearer`; a `401` wipes the token and hard-redirects to `/login`.
- **Routes:** `/login` (with email regex validation + show/hide password), `/signup` (password-strength meter, terms consent), `/logout` (clears token, redirects home).
- **Guards:** `JwtAuthGuard` and `OptionalJwtAuthGuard` (lets guests through with `request.user === null`), plus the `@CurrentUser()` decorator.
- ⚠️ No email verification, no refresh tokens, no login rate limiting, no server-side token revocation, and "Forgot password?" is an inert placeholder.

### 3.2 Daily Usage & Rate Limiting ✅

`GET /api/usage` → `{ isAuthenticated, tier, used, limit, remaining, hasAnalyzedToday }`.

| User | Limit | Tracked in |
|---|---|---|
| Guest (per IP) | 10 per 24 h — *message says 3* ⚠️ | in-memory `Map`, only on `/api/analyze` |
| Free account | `dailyLimit` (schema default **10**) per calendar day | `daily_usage` table |
| Pro account | **100** per day | `daily_usage` table |

- Pattern everywhere: **check before the LLM call → 429 with an upsell message → increment only after success.**
- 429 body: *"Daily generation limit reached. Upgrade to Pro for 100/day."*
- ⚠️ Battle, Hook, Validate, Readiness, Comments, Content-Gap, Repurpose have **no guest limiting at all**; `/analyze/alternatives` skips usage entirely.
- 🚧 `resetDailyUsage()` exists but is not exposed by any endpoint.

### 3.3 Dashboard — "Growth Command Center" ✅

`GET /api/dashboard` (JWT). Aggregates **all** generations + last 10 battles + last 10 comment analyses into one payload:

- **Stats:** total generations/battles/comment analyses, average + best virality score, **day streak** (consecutive active days), last active date.
- **Trends:** `scoreTrend { direction: up|down|flat, percentChange, slope }` via least-squares regression over **weekly averages** (last 8 weeks) — direction flips only when |slope| > 1.
- **Pattern intelligence:** `mostUsedPattern`, `bestPerformingPattern` (requires ≥2 uses), `patternStats[]` with counts and average scores.
- **Dimension analysis:** strongest / weakest psychology dimension across all analyses.
- **Cross-feature insights:** threshold-gated strings (≥3 generations unlocks pattern/dimension insights, ≥3 battles, ≥1 comment analysis, cross-sell lines).
- **Recent activity** (last 10, merged + sorted) and adaptive **quick actions** (e.g. "Battle Two Titles" until you have 3, "Analyze Your Comments" until you've run one, streak milestone every 5 days).
- **Empty state:** welcome panel with *Analyze a Title* / *Start a Battle* CTAs.

**UI:** 4 stat cards (with trend badge), Score Trend bar chart, Top Patterns bar chart, strongest/weakest dimension cards, quick-action grid, insights list, recent activity feed with per-type icons, secondary stat row (best score, most-used pattern, best-performing pattern), and a **free-tier upgrade banner**.

### 3.4 Unified History ✅

`GET /api/history?cursor&limit&type` (JWT). Merges **8 record types** — generation, battle, hook, comment, readiness, gap, validation, repurpose — into one cursor-paginated feed of uniform items `{ id, type, title, summary, score?, date, link }`.

- **Tier caps:** free = **exactly 5 per page** (the `limit` param is ignored); pro = up to **50** (lookahead row powers `hasMore`/`nextCursor`).
- `type` filter accepts the 8 known codes, default `all`.
- **UI:** filter pills per type, rows with icon/label/relative date/summary/mini score bar, deep links back to the originating tool (`/generate?id=…` etc.), empty state, and a **Load More button rendered only for Pro users** with a free-tier upgrade banner.

### 3.5 Billing & Subscriptions (Lemon Squeezy) ✅

| Endpoint | Guard | Behavior |
|---|---|---|
| `POST /api/billing/checkout` | JWT | Creates a Lemon Squeezy checkout session with `custom.user_id`, redirect back to `/billing` |
| `POST /api/billing/portal` | JWT | Returns the hosted billing portal URL |
| `POST /api/billing/webhook` | none (HMAC `x-signature` over raw body) | Flips the user's tier |

- **Webhook events handled:** `subscription_created` / `order_created` → `tier: "pro"`, `dailyLimit: 100`, `subscriptionStatus: "active"`, stores Lemon customer + subscription IDs. `subscription_expired` / `subscription_cancelled` → `tier: "free"`, `dailyLimit: 3`, `status: "canceled"`.
- Signature verified with `crypto.timingSafeEqual`; if the secret is unset/placeholder the webhook no-ops gracefully.
- **UI:**
  - `/billing` — post-checkout confirmation that polls `/api/auth/me` every 2 s (max 15 tries) until `tier === "pro"`, then shows *"You're Pro!"*.
  - `/billing/settings` — plan card (Free vs Pro + Active badge), **Upgrade to Pro — $9/month** → checkout redirect, **Manage Subscription** → portal redirect.

### 3.6 Pricing ✅

Public page `/pricing` with two hard-coded plans and an 11-row comparison table:

| | **Free — $0/forever** | **Pro — $9/month** |
|---|---|---|
| Analyses per day | 3 | Unlimited (100/day) |
| Virality score, patterns, power words | ✓ | ✓ |
| Psychology dimensions | Basic | Full |
| Next Move suggestion | ✓ | ✓ |
| Generate 3 AI alternatives | — | ✓ |
| Title Battle mode | — | ✓ |
| Save & view history | limited | ✓ (full pagination/filters) |
| Export results | — | **Coming soon** 🚧 |
| Priority AI queue | — | ✓ |
| Cancel anytime | ✓ | ✓ |

CTAs adapt to auth state (Sign Up Free / Upgrade to Pro / Get Started).

### 3.7 Static & Marketing Pages ✅

| Route | Contents |
|---|---|
| `/` | Hero (dual CTA: *Analyze a Title* / *View Pricing*), core feature card, 6-tool feature grid, tabbed product showcase, testimonial + testimonials grid, no-account CTA, 5-column footer |
| `/about` | Story, "Why We Built This", team, CTA ⚠️ (CTA misses its base button class) |
| `/blog` | 4 article stubs 🚧 — all show `Coming Soon`, links are `#`, no `/blog/[slug]` route |
| `/privacy` | 5 sections incl. **AI Processing (Groq API)** disclosure, last updated July 2026 |
| `/terms` | 6 sections incl. **Usage Limits** (Free 3/day, Pro 100/day) ⚠️ still says "ViralForge" |
| `*` | Custom 404 |

### 3.8 Global Navigation & Shell ✅

- **Sticky nav** with a Features dropdown listing all **9 tools** (8 + Command Center), Pricing, Blog; auth-aware right side (Dashboard, History, usage pill, Sign Out vs Sign In, Get Started); hamburger menu on mobile with a Billing row.
- **Live usage pill:** calls `GET /api/usage` on every token/path change → *"N left"* (free, links to `/pricing`) or a green **Pro** pill (links to `/billing/settings`).
- Shared `ToolPageLayout` (icon, title, description, 3-step "How It Works" strip) on all 8 tool pages; `AnalyzingState` loading panel with rotating phase text; `BackToTop` button; per-route `TitleSetter` document titles.
- Landing-page scroll-reveal via `useScrollReveal` (IntersectionObserver).

### 3.9 Design System ✅

- Single **light, premium** theme inspired by VEED.io: white background, near-black text, one blue-indigo accent (`#4A6CF7`), soft borders/shadows, 10 px card radius.
- **Score color scale:** 0–30 needs work · 31–50 average · 51–70 good · 71–85 strong · 86–100 excellent.
- Inter for UI, JetBrains Mono for all scores/numbers ⚠️ (declared but never loaded → falls back to `ui-monospace`).
- Rule set: no pure black, single accent, subtle shadows only, generous whitespace, no dark mode (⚠️ note: `globals.css` currently ships a dark warm-brown palette — migration to the documented light theme is still pending).
- CSS animation kit: fade/scale/slide reveals, growing bars, ring pulse, floating pills; responsive from mobile → 4-column dashboard grids.

---

## 4. Engine & Infrastructure

### 4.1 Deterministic Analyzer Engine ✅ (`common/engine/`)

Pure, unit-tested functions — the reason scores are reproducible:

- `computeRealMetrics` · `detectPowerWords` · `detectPatterns` · `computeReadability` (syllable-based heuristic) · `computeViralityScore` (0–100 weighted formula: +10 number, +8 question, +7 how-to, +8 comparison, pattern/power-word bonuses, length sweet-spot, capitalization penalty) · `runPreAnalysis` · `getWeakestDimension` · `generateNextAction`.
- `POWER_WORDS` — ~150 curated trigger words grouped by persuasion category (secrety, urgency, scarcity, authority, emotion, absolutes, growth…).

### 4.2 LLM Client ✅ (`common/groq.service.ts`)

Groq via OpenAI SDK — `call(prompt)`, plus resilience helpers: `extractJson()` (strips code fences, brace-matching scan respecting strings) and `safeParse()` (JSON repair for stray backslashes/newlines).

### 4.3 Data Model ✅ (10 tables)

`users` (tier, dailyLimit, Lemon Squeezy IDs, trial) · `generations` · `daily_usage` (unique user+date) · `battles` · `comment_analyses` · `hooks` · `readiness_scores` · `content_gaps` · `validations` · `repurposes`. All feature tables cascade-delete with their user and are indexed on `user_id` + `created_at`.

### 4.4 API Platform ✅

- Global `/api` prefix, `helmet`, CORS (hardcoded to `localhost:3000` ⚠️), global `ValidationPipe` with aggregated error messages, raw body preserved for webhook signatures.
- **Swagger/OpenAPI at `/api/docs`** (bearer auth enabled).
- `GET /api/health` — status, uptime, DB connectivity (`SELECT 1`).
- 20 routes total — full master table in §6.

### 4.5 Testing ✅

- **Unit (Jest):** `auth.service.spec.ts`, `analyzer-engine.spec.ts`, `power-words.spec.ts`.
- **E2E:** `test/auth.e2e-spec.ts`, `test/analyze.e2e-spec.ts` (needs live DB + Groq key). ⚠️ Auth e2e expectations are stale vs the current response shape and schema default.

---

## 5. Known Gaps & Planned Work

**Implemented but incomplete ⚠️**
- Large parts of every tool's response are computed but never displayed (battle loser/summary, validate recommendation, readiness areas/advice, comments 7 of 9 outputs, content-gap `nobodyCovers`/recommendation, analyze titles + description).
- Guest rate limiting only exists on `/api/analyze` (and its constant vs message disagree); no throttling on auth/billing.
- `dailyLimit` truth is inconsistent: schema default 10, fallback 3, webhook downgrade 3, docs say 3.
- No client-side limit UX — 429s surface as a raw red error box, no usage bar or upgrade modal on tool pages.
- No `middleware.ts`; protected pages are guarded client-side only (token presence).
- Internal fields leak in responses (`_preA`/`_preB`, `_context`).
- Branding split: UI says "CreatorPulse AI", `/terms` says "ViralForge"; README/docs model name differs from code.

**Documented as planned but not built 🚧**
- PDF/result **export** ("coming soon" on the pricing page) and a **priority AI queue**.
- Blog articles and `/blog/[slug]` route.
- Password reset / "forgot password".
- `packages/shared/` — shared types & DTOs.
- Light-theme migration (per `THEME-OF-THE-website.md` and MODULE-00 Step 9).
- Any real external scraping — there is **no YouTube/Reddit/Google API integration**; "competitor URLs" are pasted text.
- No admin tooling (tier changes are done directly in the database).

---

## 6. Full API Surface

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | Health + DB check |
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| GET | `/api/auth/me` | JWT | Profile, tier, dailyLimit |
| POST | `/api/analyze` | Optional JWT (+IP guest quota) | Title DNA analysis |
| POST | `/api/analyze/alternatives` | JWT | 3 alternative titles for a suggestion |
| POST | `/api/battle` | Optional JWT | Head-to-head title comparison |
| POST | `/api/hook` | Optional JWT | 3 opening hook scripts |
| POST | `/api/validate` | Optional JWT | 6-dimension idea scoring |
| POST | `/api/readiness` | Optional JWT | Upload-readiness audit |
| POST | `/api/comments` | Optional JWT | Comment mining |
| POST | `/api/content-gap` | Optional JWT | Competitive gap analysis |
| POST | `/api/repurpose` | Optional JWT | 4-platform adaptation |
| GET | `/api/dashboard` | JWT | Aggregated analytics |
| GET | `/api/history` | JWT | Unified cursor-paginated feed |
| GET | `/api/usage` | JWT | Quota status |
| POST | `/api/billing/checkout` | JWT | Lemon Squeezy checkout |
| POST | `/api/billing/portal` | JWT | Billing portal link |
| POST | `/api/billing/webhook` | HMAC signature | Tier upgrade/downgrade |
| GET | `/api/docs` | — | Swagger UI |

### Frontend routes

**Public:** `/` · `/login` · `/signup` · `/logout` · `/generate` · `/battle` · `/hook` · `/validate` · `/readiness` · `/comments` · `/content-gap` · `/repurpose` · `/pricing` · `/about` · `/blog` · `/privacy` · `/terms`
**Protected (client-side token check):** `/dashboard` · `/history` · `/billing` · `/billing/settings`
