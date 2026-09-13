import { IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AlternativesDto {
  @ApiProperty({ example: "10 Ways to Grow Your YouTube Channel in 2024" })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: "Add a curiosity gap by hinting at something unexpected" })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  suggestion: string;
}
