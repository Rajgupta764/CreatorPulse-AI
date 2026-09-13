import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "creator@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "securePassword123" })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: "John Creator", required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName?: string;
}
