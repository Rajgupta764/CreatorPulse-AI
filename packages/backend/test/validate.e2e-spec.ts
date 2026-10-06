import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { GroqService } from "../src/common/groq.service";
import { LIMITS } from "../src/common/config/limits";
import { validationPipeOptions } from "../src/common/validation";

const TEST_PASSWORD = "ValidateE2E!123";

function groqStub() {
  const analysis = {
    competition: { score: 61, explanation: "Moderate saturation in this niche." },
    demand: { score: 70, explanation: "Steady, consistent search interest." },
    virality: { score: 66, explanation: "The angle is easy to share." },
    difficulty: { score: 40, explanation: "Straightforward to research and film." },
    contentGap: { score: 58, explanation: "Few creators cover this angle." },
    opportunity: { score: 64, explanation: "Solid upside for the effort." },
    overallScore: 64,
    recommendation: "Worth making — sharpen the opening hook.",
  };

  if (process.env.E2E_LIVE === "1") return undefined;
  return {
    call: jest.fn(async () => JSON.stringify(analysis)),
    extractJson: (t: string) => t,
    safeParse: JSON.parse,
  };
}

describe("Validate (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  const testEmail = `e2e-validate-${Date.now()}@example.com`;

  beforeAll(async () => {
    const stub = groqStub();
    let builder = Test.createTestingModule({ imports: [AppModule] });
    if (stub) builder = builder.overrideProvider(GroqService).useValue(stub);

    const moduleFixture: TestingModule = await builder.compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
    await app.init();

    prisma = app.get(PrismaService);

    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: testEmail,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        displayName: "Validate E2E",
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: testEmail, password: TEST_PASSWORD })
      .expect(201);

    token = loginRes.body.access_token;
    expect(token).toBeDefined();
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.dailyUsage.deleteMany({ where: { userId: user.id } });
      await prisma.validation.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await app.close();
  });

  describe("POST /api/validate", () => {
    beforeEach(async () => {
      await prisma.dailyUsage.deleteMany({
        where: { user: { email: testEmail } },
      });
      await prisma.validation.deleteMany({
        where: { user: { email: testEmail } },
      });
    });

    it("scores a well-formed idea", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/validate")
        .set("Authorization", `Bearer ${token}`)
        .send({ idea: "How to edit videos faster using keyboard shortcuts" })
        .expect(201);

      expect(typeof res.body.overallScore).toBe("number");
      expect(res.body.overallScore).toBeGreaterThanOrEqual(0);
      expect(res.body.overallScore).toBeLessThanOrEqual(100);
      expect(typeof res.body.recommendation).toBe("string");

      const usage = await request(app.getHttpServer())
        .get("/api/usage")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(usage.body.used).toBe(1);

      const rows = await prisma.validation.count({
        where: { user: { email: testEmail } },
      });
      expect(rows).toBe(1);
    });

    it("rejects ideas below the length floor with a readable message", () => {
      return request(app.getHttpServer())
        .post("/api/validate")
        .set("Authorization", `Bearer ${token}`)
        .send({ idea: "too short" })
        .expect(400)
        .expect((res) => {
          expect(String(res.body.message)).toContain("at least 20 characters");
        });
    });

    it("rejects nonsense ideas without spending a credit or saving a row", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/validate")
        .set("Authorization", `Bearer ${token}`)
        .send({ idea: "jflaklsdgkljaslgj jflaklsdgkljaslgj" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_INPUT");
      expect(typeof res.body.error).toBe("string");

      const usage = await request(app.getHttpServer())
        .get("/api/usage")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(usage.body.used).toBe(0);

      const rows = await prisma.validation.count({
        where: { user: { email: testEmail } },
      });
      expect(rows).toBe(0);
    });

    it("rejects symbol-only input", () => {
      return request(app.getHttpServer())
        .post("/api/validate")
        .set("Authorization", `Bearer ${token}`)
        .send({ idea: "!!! @@@ ### ??? @@@ ### ???" })
        .expect(400);
    });

    it("enforces the daily budget", async () => {
      for (let i = 0; i < LIMITS.freeDailyCredits; i++) {
        await request(app.getHttpServer())
          .post("/api/validate")
          .set("Authorization", `Bearer ${token}`)
          .send({ idea: `Validate run number ${i + 1} of the day` })
          .expect(201);
      }

      const blocked = await request(app.getHttpServer())
        .post("/api/validate")
        .set("Authorization", `Bearer ${token}`)
        .send({ idea: "One more idea past the daily allowance" });

      expect(blocked.status).toBe(429);
      expect(blocked.body.code).toBe("LIMIT_REACHED");
    });
  });
});
