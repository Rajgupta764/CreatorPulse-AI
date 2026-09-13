import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ValidateService } from "./validate.service";
import { ValidateDto } from "./dto/validate.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Validate")
@Controller("validate")
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async validate(
    @Body() dto: ValidateDto,
    @CurrentUser() user?: { id: string },
  ) {
    return this.validateService.validate(dto, user?.id);
  }
}
