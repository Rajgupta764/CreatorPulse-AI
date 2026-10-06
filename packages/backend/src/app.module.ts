import { Module } from "@nestjs/common";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { throttlerConfig } from "./common/config/limits";
import { RedisModule } from "./redis/redis.module";
import { RedisThrottlerStorage } from "./redis/redis-throttler.storage";
import { PrismaModule } from "./prisma/prisma.module";
import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";
import { AnalyzeModule } from "./analyze/analyze.module";
import { BattleModule } from "./battle/battle.module";
import { HookModule } from "./hook/hook.module";
import { ValidateModule } from "./validate/validate.module";
import { ReadinessModule } from "./readiness/readiness.module";
import { CommentsModule } from "./comments/comments.module";
import { ContentGapModule } from "./content-gap/content-gap.module";
import { RepurposeModule } from "./repurpose/repurpose.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { UsageModule } from "./usage/usage.module";
import { BillingModule } from "./billing/billing.module";
import { HistoryModule } from "./history/history.module";

@Module({
  imports: [
    RedisModule,
    ThrottlerModule.forRootAsync({
      inject: [RedisThrottlerStorage],
      useFactory: (storage: RedisThrottlerStorage) => ({
        throttlers: throttlerConfig(),
        storage,
      }),
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    AnalyzeModule,
    BattleModule,
    HookModule,
    ValidateModule,
    ReadinessModule,
    CommentsModule,
    ContentGapModule,
    RepurposeModule,
    DashboardModule,
    UsageModule,
    BillingModule,
    HistoryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
