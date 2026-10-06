import { Controller, Delete, Get, Param, Query, UseGuards } from "@nestjs/common";
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

  @Get(":type/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getItem(
    @CurrentUser() user: { id: string; email: string },
    @Param("type") type: string,
    @Param("id") id: string,
  ) {
    return this.historyService.getItem(user.id, type, id);
  }

  @Delete(":type/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteItem(
    @CurrentUser() user: { id: string; email: string },
    @Param("type") type: string,
    @Param("id") id: string,
  ) {
    return this.historyService.deleteItem(user.id, type, id);
  }
}
