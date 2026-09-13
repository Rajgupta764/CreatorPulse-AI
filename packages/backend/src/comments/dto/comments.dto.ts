import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CommentsDto {
  @ApiProperty({ example: "Great video! Could you make a tutorial on..." })
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  comments: string;

  @ApiProperty({ example: "tech", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  niche?: string;
}
