import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CommentsService } from "./comments.service";
import { CommentsDto } from "./dto/comments.dto";
import { OptionalJwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Comments")
@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  async analyze(
    @Body() dto: CommentsDto,
    @CurrentUser() user?: { id: string }
  ) {
    return this.commentsService.analyze(dto, user?.id);
  }
}
