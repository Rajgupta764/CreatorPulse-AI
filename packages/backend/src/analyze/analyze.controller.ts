import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyzeService } from "./analyze.service";
import { AnalyzeDto } from "./dto/analyze.dto";
import { AlternativesDto } from "./dto/alternatives.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Analyze")
@Controller("analyze")
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async analyze(
    @Body() dto: AnalyzeDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.analyzeService.analyze(dto, user.id);
  }

  @Post("alternatives")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async alternatives(
    @Body() dto: AlternativesDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.analyzeService.generateAlternatives(dto.title, dto.suggestion, user.id);
  }
}
