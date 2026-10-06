import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import type { Request } from "express";
import { HookService } from "./hook.service";
import { HookDto } from "./dto/hook.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AiEnabledGuard } from "../common/guards/ai-enabled.guard";
import { HTTP_LIMITS, routeThrottle } from "../common/config/limits";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Hook")
@Controller("hook")
export class HookController {
  constructor(private readonly hookService: HookService) {}

  @Post()
  @UseGuards(AiEnabledGuard, OptionalJwtAuthGuard)
  @Throttle(routeThrottle(HTTP_LIMITS.ai))
  @ApiBearerAuth()
  async generate(
    @Body() dto: HookDto,
    @CurrentUser() user: { id: string } | null,
    @Req() req: Request,
  ) {
    return this.hookService.generate(dto, user?.id, req.ip);
  }
}
