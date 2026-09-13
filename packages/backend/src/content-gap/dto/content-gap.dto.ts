import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ContentGapDto {
  @ApiProperty({ example: "https://youtube.com/@competitor", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  urls?: string;

  @ApiProperty({ example: "video editing tutorials, color grading", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  topics?: string;
}
