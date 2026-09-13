import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  async check() {
    let dbStatus = "disconnected";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      // dbStatus stays disconnected
    }

    return {
      status: "ok",
      uptime: process.uptime(),
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
