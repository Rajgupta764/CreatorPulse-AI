import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import type { Request } from "express";
import { AnalyzeService } from "./analyze.service";
import { AnalyzeDto } from "./dto/analyze.dto";
import { AlternativesDto } from "./dto/alternatives.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AiEnabledGuard } from "../common/guards/ai-enabled.guard";
import { HTTP_LIMITS, routeThrottle } from "../common/config/limits";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Analyze")
@Controller("analyze")
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}

  @Post()
  @UseGuards(AiEnabledGuard, OptionalJwtAuthGuard)
  @Throttle(routeThrottle(HTTP_LIMITS.ai))
  @ApiBearerAuth()
  async analyze(
    @Body() dto: AnalyzeDto,
    @CurrentUser() user: { id: string } | null,
    @Req() req: Request,
  ) {
    return this.analyzeService.analyze(dto, user?.id, req.ip);
  }

  @Post("alternatives")
  @UseGuards(AiEnabledGuard, OptionalJwtAuthGuard)
  @Throttle(routeThrottle(HTTP_LIMITS.ai))
  @ApiBearerAuth()
  async alternatives(
    @Body() dto: AlternativesDto,
    @CurrentUser() user: { id: string } | null,
    @Req() req: Request,
  ) {
    return this.analyzeService.generateAlternatives(dto.title, dto.suggestion, user?.id, req.ip);
  }
}
