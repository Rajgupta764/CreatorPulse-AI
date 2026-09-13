import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { BattleService } from "./battle.service";
import { BattleDto } from "./dto/battle.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Battle")
@Controller("battle")
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async battle(
    @Body() dto: BattleDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.battleService.battle(dto, user?.id);
  }
}
