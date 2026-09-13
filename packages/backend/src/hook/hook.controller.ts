import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { HookService } from "./hook.service";
import { HookDto } from "./dto/hook.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Hook")
@Controller("hook")
export class HookController {
  constructor(private readonly hookService: HookService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async generate(
    @Body() dto: HookDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.hookService.generate(dto, user?.id);
  }
}
