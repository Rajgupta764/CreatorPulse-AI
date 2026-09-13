# Module 11 — Usage (Rate Limiting & Daily Tracking)

> **Goal:** Track daily usage per authenticated user (3 analyses/day free, 100/day Pro) and per guest IP (3 total analyses). Return usage stats so the frontend can display remaining credits.

---

## Files to Create

```
packages/backend/src/usage/
├── usage.module.ts
├── usage.controller.ts
├── usage.service.ts
└── dto/
    └── usage.dto.ts
```

---

## DTO

### `usage/dto/usage.dto.ts`

```typescript
export class UsageResponse {
  isAuthenticated: boolean;
  used: number;
  limit: number;
  remaining: number;
  hasAnalyzedToday: boolean;
}
```

---

## Usage Service

### `usage/usage.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  async getUsage(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await this.prisma.dailyUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const used = usage?.count ?? 0;
    const limit = user.dailyLimit;

    return {
      isAuthenticated: true,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      hasAnalyzedToday: used > 0,
    };
  }
}
```

---

## Usage Controller

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UsageService } from "./usage.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Usage")
@Controller("usage")
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUsage(@CurrentUser() user: { id: string }) {
    return this.usageService.getUsage(user.id);
  }
}
```

---

## Usage Module

```typescript
import { Module } from "@nestjs/common";
import { UsageController } from "./usage.controller";
import { UsageService } from "./usage.service";

@Module({
  controllers: [UsageController],
  providers: [UsageService],
})
export class UsageModule {}
```

---

## Guest Rate Limiting (In-Memory)

For non-authenticated users, rate limiting is handled at the controller level using an in-memory Map.

### Add to `analyze/analyze.controller.ts`

```typescript
const GUEST_LIMIT = 3;
const guestUsage = new Map<string, number>();

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1";
}
```

Update the analyze method:

```typescript
@Post()
async analyze(
  @Body() dto: AnalyzeDto,
  @CurrentUser() user?: { id: string },
  @Req() request?: any
) {
  if (!user) {
    const ip = getClientIp(request);
    const used = guestUsage.get(ip) ?? 0;
    if (used >= GUEST_LIMIT) {
      throw new HttpException(
        { error: "Free demo allows 3 generations. Sign in for 3 analyses per day." },
        429
      );
    }
    guestUsage.set(ip, used + 1);
  }
  return this.analyzeService.analyze(dto, user?.id);
}
```

---

## API Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/usage` | Required | Get daily usage stats |

### Response
```json
{
  "isAuthenticated": true,
  "used": 4,
  "limit": 3,
  "remaining": 6,
  "hasAnalyzedToday": true
}
```

---

## Database

### Table: `daily_usage`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, unique with date |
| date | DATE | Current date (UTC) |
| count | INT | Number of analyses today |

### Increment Logic (in AnalyzeService)

```typescript
private async incrementUsage(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await this.prisma.dailyUsage.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, date: today, count: 1 },
  });
}
```

---

## Frontend Changes

### Files to DELETE
```
src/app/api/usage/route.ts  → replaced by NestJS controller
```

### Files to UPDATE
```
src/app/generate/page.tsx  → uses GET /api/usage to show remaining credits
```

---

## Rate Limits Summary

| User Type | Limit | Tracking Method |
|---|---|---|
| Authenticated | 3 analyses/day (free), 100/day (Pro) | `daily_usage` table in PostgreSQL |
| Guest | 3 analyses total | In-memory `Map<string, number>` keyed by IP |

---

## Acceptance Criteria

- [ ] `GET /api/usage` returns correct used/remaining/limit for authenticated user
- [ ] Increment happens after each successful analysis
- [ ] Rate limit response returns 429 with clear message when exceeded
- [ ] Guest IP tracking resets on server restart (acceptable for dev)
- [ ] Frontend displays remaining credits correctly
- [ ] `daily_usage` upsert works correctly (no duplicate key errors)
