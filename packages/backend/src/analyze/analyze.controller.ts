import { Controller, Post, Body, UseGuards, HttpException, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyzeService } from "./analyze.service";
import { AnalyzeDto } from "./dto/analyze.dto";
import { AlternativesDto } from "./dto/alternatives.dto";
import { JwtAuthGuard, OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

const GUEST_LIMIT = 10;
const GUEST_WINDOW_MS = 24 * 60 * 60 * 1000;
const guestUsage = new Map<string, { count: number; timestamp: number }>();

function getClientIp(request: any): string {
  return request.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || request.headers["x-real-ip"]
    || "127.0.0.1";
}

function getGuestCount(ip: string): number {
  const entry = guestUsage.get(ip);
  if (!entry) return 0;
  if (Date.now() - entry.timestamp > GUEST_WINDOW_MS) {
    guestUsage.delete(ip);
    return 0;
  }
  return entry.count;
}

@ApiTags("Analyze")
@Controller("analyze")
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async analyze(
    @Body() dto: AnalyzeDto,
    @CurrentUser() user?: { id: string },
    @Req() request?: any
  ) {
    if (!user) {
      const ip = getClientIp(request);
      const used = getGuestCount(ip);
      if (used >= GUEST_LIMIT) {
        throw new HttpException(
          { error: "Free demo allows 3 generations. Sign in for 3 analyses per day." },
          429
        );
      }
      guestUsage.set(ip, { count: used + 1, timestamp: Date.now() });
    }
    return this.analyzeService.analyze(dto, user?.id);
  }

  @Post("alternatives")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async alternatives(@Body() dto: AlternativesDto) {
    return this.analyzeService.generateAlternatives(dto.title, dto.suggestion);
  }
}
