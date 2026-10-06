import "reflect-metadata";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { validationPipeOptions } from "./common/validation";
import { billingEnvIssues } from "./billing/billing.service";

const requiredEnvs = ["DATABASE_URL", "JWT_SECRET"];
const recommendedEnvs = ["GROQ_API_KEY", "REDIS_URL"];

function corsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS || "http://localhost:3000";
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of requiredEnvs) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  for (const key of recommendedEnvs) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}. Check your .env file.`);
  }
  if (warnings.length > 0) {
    Logger.warn(`Missing recommended env vars: ${warnings.join(", ")}. Some features may not work.`, "Bootstrap");
  }

  const billingIssues = billingEnvIssues();
  if (billingIssues.length > 0) {
    Logger.warn(
      `Billing not fully configured: ${billingIssues.join(", ")}. Checkout and webhooks will fail until fixed.`,
      "Bootstrap",
    );
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: corsOrigins(),
    credentials: true,
  });

  app.use(helmet());

  // Needed for correct client IPs (guest quota) behind a reverse proxy.
  if (process.env.TRUST_PROXY === "true") {
    app.getHttpAdapter().getInstance().set("trust proxy", 1);
  }

  app.setGlobalPrefix("api");

  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

  const swaggerEnabled =
    process.env.SWAGGER_ENABLED === "true" || process.env.NODE_ENV !== "production";
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle("CreatorPulse AI API")
      .setDescription("Research Intelligence for YouTube Creators")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
