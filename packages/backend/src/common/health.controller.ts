import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
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

    const body = {
      status: dbStatus === "connected" ? "ok" : "degraded",
      uptime: process.uptime(),
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };

    // 503 so load balancers and uptime monitors treat a broken DB as down.
    if (dbStatus !== "connected") {
      throw new ServiceUnavailableException(body);
    }

    return body;
  }
}
