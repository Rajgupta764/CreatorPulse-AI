import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ReadinessService } from "./readiness.service";
import { ReadinessDto } from "./dto/readiness.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Readiness")
@Controller("readiness")
export class ReadinessController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async score(
    @Body() dto: ReadinessDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.readinessService.score(dto, user.id);
  }
}
