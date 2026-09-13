import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ValidateDto {
  @ApiProperty({ example: "How to edit videos faster using keyboard shortcuts" })
  @IsString()
  @MaxLength(1000)
  idea: string;

  @ApiProperty({ example: "tech", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  niche?: string;
}
