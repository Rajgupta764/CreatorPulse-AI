import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class HookDto {
  @ApiProperty({ example: "10 Ways to Grow Your YouTube Channel" })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: "tech", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  niche?: string;
}
