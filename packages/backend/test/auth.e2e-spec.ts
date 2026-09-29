import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = `e2e-test-${Date.now()}@example.com`;
  const testPassword = "TestPass123!";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.dailyUsage.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await app.close();
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: "TestPass123!",
          confirmPassword: "TestPass123!",
          displayName: "E2E Test User",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.id).toBeDefined();
          expect(res.body.user.email).toBe(testEmail);
          expect(res.body.user.displayName).toBe("E2E Test User");
          expect(res.body.user.tier).toBe("free");
        });
    });

    it("rejects duplicate email", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: testEmail,
          password: "AnotherPass123!",
          confirmPassword: "AnotherPass123!",
        })
        .expect(409);
    });

    it("rejects weak password (too short)", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "shortpw@example.com",
          password: "123",
          confirmPassword: "123",
        })
        .expect(400);
    });

    it("rejects password without uppercase", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "noupper@example.com",
          password: "lowercase123!",
          confirmPassword: "lowercase123!",
        })
        .expect(400);
    });

    it("rejects password without special character", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "nospecial@example.com",
          password: "NoSpecial123",
          confirmPassword: "NoSpecial123",
        })
        .expect(400);
    });

    it("rejects password mismatch", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "mismatch@example.com",
          password: "TestPass123!",
          confirmPassword: "DifferentPass123!",
        })
        .expect(400);
    });

    it("rejects display name with special characters", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "specialname@example.com",
          password: "TestPass123!",
          confirmPassword: "TestPass123!",
          displayName: "Bad@Name#",
        })
        .expect(400);
    });

    it("rejects display name too short", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "shortname@example.com",
          password: "TestPass123!",
          confirmPassword: "TestPass123!",
          displayName: "A",
        })
        .expect(400);
    });

    it("rejects extra properties (whitelist)", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "extra@example.com",
          password: "TestPass123!",
          confirmPassword: "TestPass123!",
          isAdmin: true,
        })
        .expect(400);
    });

    it("registers without display name (optional)", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: `nodisplay-${Date.now()}@example.com`,
          password: "TestPass123!",
          confirmPassword: "TestPass123!",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.displayName).toBeNull();
        });
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns access token on valid credentials", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testEmail, password: testPassword })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.email).toBe(testEmail);
        });
    });

    it("rejects wrong password", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testEmail, password: "wrongpassword" })
        .expect(401);
    });

    it("rejects nonexistent email", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "anypassword" })
        .expect(401);
    });
  });

  describe("GET /api/auth/me", () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testEmail, password: testPassword });
      token = res.body.access_token;
    });

    it("returns user profile with valid token", () => {
      return request(app.getHttpServer())
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testEmail);
          expect(res.body.tier).toBe("free");
        });
    });

    it("rejects request without token", () => {
      return request(app.getHttpServer()).get("/api/auth/me").expect(401);
    });

    it("rejects request with invalid token", () => {
      return request(app.getHttpServer())
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token-here")
        .expect(401);
    });
  });
});
