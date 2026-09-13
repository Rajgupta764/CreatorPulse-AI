import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Analyze (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  const testEmail = `e2e-analyze-${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true })
    );
    await app.init();

    prisma = app.get(PrismaService);

    const registerRes = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: testEmail, password: "analyzeE2E123" });
    if (registerRes.status !== 201) {
      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testEmail, password: "analyzeE2E123" });
      token = loginRes.body.access_token;
    } else {
      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testEmail, password: "analyzeE2E123" });
      token = loginRes.body.access_token;
    }
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.dailyUsage.deleteMany({ where: { userId: user.id } });
      await prisma.generation.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await app.close();
  });

  describe("POST /api/analyze", () => {
    it("returns virality analysis for a valid title", () => {
      return request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "How to Grow Your YouTube Channel in 2024" })
        .expect(201)
        .expect((res) => {
          expect(res.body.analysis).toBeDefined();
          expect(res.body.analysis.computedViralityScore).toBeGreaterThanOrEqual(0);
          expect(res.body.analysis.computedViralityScore).toBeLessThanOrEqual(100);
          expect(res.body.analysis.powerWords).toBeDefined();
          expect(res.body.analysis.detectedPatterns).toBeDefined();
          expect(res.body.titles).toBeDefined();
          expect(res.body.titles.length).toBe(5);
        });
    });

    it("rejects empty title", () => {
      return request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "" })
        .expect(400);
    });

    it("handles optional niche", () => {
      return request(app.getHttpServer())
        .post("/api/analyze")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Quick Tips for Productivity", niche: "productivity" })
        .expect(201)
        .expect((res) => {
          expect(res.body.analysis).toBeDefined();
        });
    });
  });
});
