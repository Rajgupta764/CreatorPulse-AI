import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import type { Request } from "express";
import { BattleService } from "./battle.service";
import { BattleDto } from "./dto/battle.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AiEnabledGuard } from "../common/guards/ai-enabled.guard";
import { HTTP_LIMITS, routeThrottle } from "../common/config/limits";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Battle")
@Controller("battle")
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  @UseGuards(AiEnabledGuard, OptionalJwtAuthGuard)
  @Throttle(routeThrottle(HTTP_LIMITS.ai))
  @ApiBearerAuth()
  async battle(
    @Body() dto: BattleDto,
    @CurrentUser() user: { id: string } | null,
    @Req() req: Request,
  ) {
    return this.battleService.battle(dto, user?.id, req.ip);
  }
}
