import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { RepurposeService } from "./repurpose.service";
import { RepurposeDto } from "./dto/repurpose.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Repurpose")
@Controller("repurpose")
export class RepurposeController {
  constructor(private readonly repurposeService: RepurposeService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async repurpose(
    @Body() dto: RepurposeDto,
    @CurrentUser() user?: { id: string },
  ) {
    return this.repurposeService.repurpose(dto, user?.id);
  }
}
