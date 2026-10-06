import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import type { Request } from "express";
import { ContentGapService } from "./content-gap.service";
import { ContentGapDto } from "./dto/content-gap.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AiEnabledGuard } from "../common/guards/ai-enabled.guard";
import { HTTP_LIMITS, routeThrottle } from "../common/config/limits";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Content-Gap")
@Controller("content-gap")
export class ContentGapController {
  constructor(private readonly contentGapService: ContentGapService) {}

  @Post()
  @UseGuards(AiEnabledGuard, OptionalJwtAuthGuard)
  @Throttle(routeThrottle(HTTP_LIMITS.ai))
  @ApiBearerAuth()
  async findGaps(
    @Body() dto: ContentGapDto,
    @CurrentUser() user: { id: string } | null,
    @Req() req: Request,
  ) {
    return this.contentGapService.findGaps(dto, user?.id, req.ip);
  }
}
