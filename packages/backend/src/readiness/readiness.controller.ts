import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import type { Request } from "express";
import { ReadinessService } from "./readiness.service";
import { ReadinessDto } from "./dto/readiness.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AiEnabledGuard } from "../common/guards/ai-enabled.guard";
import { HTTP_LIMITS, routeThrottle } from "../common/config/limits";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Readiness")
@Controller("readiness")
export class ReadinessController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Post()
  @UseGuards(AiEnabledGuard, OptionalJwtAuthGuard)
  @Throttle(routeThrottle(HTTP_LIMITS.ai))
  @ApiBearerAuth()
  async score(
    @Body() dto: ReadinessDto,
    @CurrentUser() user: { id: string } | null,
    @Req() req: Request,
  ) {
    return this.readinessService.score(dto, user?.id, req.ip);
  }
}
