import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ValidateDto {
  @ApiProperty({ example: "How to edit videos faster using keyboard shortcuts" })
  @IsString()
  @MinLength(20, {
    message: "Describe your idea in a bit more detail — it needs at least 20 characters.",
  })
  @MaxLength(1000)
  idea: string;

  @ApiProperty({ example: "tech", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  niche?: string;
}
