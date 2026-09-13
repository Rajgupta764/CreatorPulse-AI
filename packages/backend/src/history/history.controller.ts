import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { HistoryService } from "./history.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("History")
@Controller("history")
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getHistory(
    @CurrentUser() user: { id: string; email: string },
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
    @Query("type") type?: string,
  ) {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id }, select: { tier: true } });
    return this.historyService.getHistory(
      user.id,
      dbUser?.tier || "free",
      cursor || undefined,
      limit ? parseInt(limit) : 15,
      type || "all",
    );
  }
}
