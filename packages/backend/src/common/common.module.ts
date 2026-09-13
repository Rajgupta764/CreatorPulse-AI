import { Global, Module } from "@nestjs/common";
import { GroqService } from "./groq.service";
import { HealthController } from "./health.controller";

@Global()
@Module({
  controllers: [HealthController],
  providers: [GroqService],
  exports: [GroqService],
})
export class CommonModule {}
