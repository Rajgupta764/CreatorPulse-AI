import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import type { Request } from "express";
import { ValidateService } from "./validate.service";
import { ValidateDto } from "./dto/validate.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AiEnabledGuard } from "../common/guards/ai-enabled.guard";
import { HTTP_LIMITS, routeThrottle } from "../common/config/limits";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Validate")
@Controller("validate")
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}

  @Post()
  @UseGuards(AiEnabledGuard, OptionalJwtAuthGuard)
  @Throttle(routeThrottle(HTTP_LIMITS.ai))
  @ApiBearerAuth()
  async validate(
    @Body() dto: ValidateDto,
    @CurrentUser() user: { id: string } | null,
    @Req() req: Request,
  ) {
    return this.validateService.validate(dto, user?.id, req.ip);
  }
}
