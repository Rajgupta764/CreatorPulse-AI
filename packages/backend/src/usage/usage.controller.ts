import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import type { Request } from "express";
import { UsageService } from "./usage.service";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Usage")
@Controller("usage")
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  /** Signed-in users get their credit balance; guests get the per-IP quota. */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async getUsage(
    @CurrentUser() user: { id: string } | null,
    @Req() req: Request,
  ) {
    if (user?.id) return this.usageService.getUsage(user.id);
    return this.usageService.getGuestUsage(req.ip);
  }
}
