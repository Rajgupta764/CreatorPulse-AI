import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ContentGapService } from "./content-gap.service";
import { ContentGapDto } from "./dto/content-gap.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Content-Gap")
@Controller("content-gap")
export class ContentGapController {
  constructor(private readonly contentGapService: ContentGapService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async findGaps(
    @Body() dto: ContentGapDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.contentGapService.findGaps(dto, user?.id);
  }
}
