import "reflect-metadata";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, BadRequestException, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const requiredEnvs = ["DATABASE_URL", "JWT_SECRET"];
const recommendedEnvs = ["GROQ_API_KEY"];

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
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  app.use(helmet());

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const messages = errors.map((e) =>
          Object.values(e.constraints || {}).join(", ")
        );
        return new BadRequestException(messages.join("; "));
      },
    })
  );

  const config = new DocumentBuilder()
    .setTitle("CreatorPulse AI API")
    .setDescription("Research Intelligence for YouTube Creators")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
