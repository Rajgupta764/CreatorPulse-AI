import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "creator@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "securePassword123" })
  @IsString()
  password: string;
}
