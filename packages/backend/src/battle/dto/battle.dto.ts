import { IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BattleDto {
  @ApiProperty({ example: "10 Ways to Grow Your YouTube Channel" })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  titleA: string;

  @ApiProperty({ example: "The Secret to Growing on YouTube in 2024" })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  titleB: string;
}
