import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import type { Request } from "express";
import { RepurposeService } from "./repurpose.service";
import { RepurposeDto } from "./dto/repurpose.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AiEnabledGuard } from "../common/guards/ai-enabled.guard";
import { HTTP_LIMITS, routeThrottle } from "../common/config/limits";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Repurpose")
@Controller("repurpose")
export class RepurposeController {
  constructor(private readonly repurposeService: RepurposeService) {}

  @Post()
  @UseGuards(AiEnabledGuard, OptionalJwtAuthGuard)
  @Throttle(routeThrottle(HTTP_LIMITS.ai))
  @ApiBearerAuth()
  async repurpose(
    @Body() dto: RepurposeDto,
    @CurrentUser() user: { id: string } | null,
    @Req() req: Request,
  ) {
    return this.repurposeService.repurpose(dto, user?.id, req.ip);
  }
}
