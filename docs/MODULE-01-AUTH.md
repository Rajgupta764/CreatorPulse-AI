# Module 01 — Auth (Custom JWT)

> **Goal:** Implement user registration, login, and profile retrieval using email/password with bcrypt hashing and JWT tokens.

---

## Files to Create

```
packages/backend/src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── dto/
│   ├── register.dto.ts
│   └── login.dto.ts
└── strategies/
    └── jwt.strategy.ts

packages/backend/src/common/guards/
└── jwt-auth.guard.ts

packages/backend/src/common/decorators/
└── current-user.decorator.ts
```

---

## DTOs

### `auth/dto/register.dto.ts`

```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "creator@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "securePassword123" })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: "John Creator", required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName?: string;
}
```

### `auth/dto/login.dto.ts`

```typescript
import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "creator@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "securePassword123" })
  @IsString()
  password: string;
}
```

---

## Auth Service

### `auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName || null,
      },
    });

    return { id: user.id, email: user.email, displayName: user.displayName };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("Invalid email or password");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid email or password");

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      access_token: token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("User not found");

    return { id: user.id, email: user.email, displayName: user.displayName };
  }
}
```

---

## JWT Strategy

### `auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "dev-secret",
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
```

---

## Auth Controller

### `auth/auth.controller.ts`

```typescript
import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@CurrentUser() user: { id: string; email: string }) {
    return this.authService.getProfile(user.id);
  }
}
```

---

## Guards & Decorators

### `common/guards/jwt-auth.guard.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

### `common/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
```

---

## Auth Module

### `auth/auth.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dev-secret",
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || "7d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## Update `AppModule`

### `app.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { CommonModule } from "./common/common.module";

@Module({
  imports: [PrismaModule, CommonModule, AuthModule],
})
export class AppModule {}
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create new account |
| POST | `/api/auth/login` | No | Sign in, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Response Shapes

**POST /api/auth/register — Success (201)**
```json
{
  "id": "uuid",
  "email": "creator@example.com",
  "displayName": "John Creator"
}
```

**POST /api/auth/login — Success (200)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "creator@example.com",
    "displayName": "John Creator"
  }
}
```

**POST /api/auth/login — Error (401)**
```json
{
  "message": "Invalid email or password",
  "statusCode": 401
}
```

**GET /api/auth/me — Success (200)**
```json
{
  "id": "uuid",
  "email": "creator@example.com",
  "displayName": "John Creator"
}
```

---

## Frontend Changes

### Update Login Page `packages/frontend/src/app/(auth)/login/page.tsx`

The login page currently uses Supabase. Replace the auth call with a fetch to NestJS:

```typescript
// Replace supabase.auth.signInWithPassword(...) with:
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
localStorage.setItem("access_token", data.access_token);
```

### Update Signup Page `packages/frontend/src/app/(auth)/signup/page.tsx`

```typescript
// Replace supabase.auth.signUp(...) with:
const res = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, displayName }),
});
```

### Add API Client Helper `packages/frontend/src/lib/api-client.ts`

```typescript
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && token) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  return res;
}
```

---

## Database

### Table: `users` (created by Prisma migration in Module 00)

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, auto-generated |
| email | TEXT | Unique, indexed |
| password_hash | TEXT | bcrypt hash (12 rounds) |
| display_name | TEXT? | Nullable |
| created_at | TIMESTAMPTZ | Default now() |
| updated_at | TIMESTAMPTZ | Auto-updated |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Duplicate email on register | Returns `409 Conflict` with "Email already registered" |
| Wrong password on login | Returns `401 Unauthorized` with "Invalid email or password" (same message as wrong email — no user enumeration) |
| Expired JWT | Returns `401 Unauthorized` from JwtAuthGuard |
| Missing JWT on protected route | Returns `401 Unauthorized` from JwtAuthGuard |
| Password too short | Returns `400 Bad Request` from ValidationPipe (min 8 chars) |
| Invalid email format | Returns `400 Bad Request` from ValidationPipe |
| Display name too long | Returns `400 Bad Request` from ValidationPipe (max 50 chars) |

---

## Acceptance Criteria

- [ ] `POST /api/auth/register` creates a user and returns their profile (without password)
- [ ] `POST /api/auth/register` with existing email returns 409
- [ ] `POST /api/auth/login` with valid credentials returns `{ access_token, user }`
- [ ] `POST /api/auth/login` with wrong password returns 401
- [ ] `POST /api/auth/login` with wrong email returns 401
- [ ] `GET /api/auth/me` with valid JWT returns user profile
- [ ] `GET /api/auth/me` without JWT returns 401
- [ ] `GET /api/auth/me` with expired JWT returns 401
- [ ] All auth endpoints appear in Swagger docs at `/api/docs`
- [ ] Frontend login page calls NestJS and stores `access_token` in localStorage
- [ ] Frontend signup page calls NestJS and redirects to login
- [ ] `apiFetch` utility attaches `Authorization: Bearer <token>` header automatically
- [ ] Expired token triggers logout and redirect to `/login`
