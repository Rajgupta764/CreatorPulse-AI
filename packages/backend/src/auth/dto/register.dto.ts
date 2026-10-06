import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsNotEmpty,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

@ValidatorConstraint({ name: "IsEqualTo", async: false })
class IsEqualToConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    return "Passwords do not match";
  }
}

export class RegisterDto {
  @ApiProperty({ example: "creator@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "SecurePass123!" })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  password!: string;

  @ApiProperty({ example: "SecurePass123!" })
  @IsString()
  @Validate(IsEqualToConstraint, ["password"])
  confirmPassword!: string;

  @ApiProperty({ example: "John Creator", required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_\-\s]+$/, {
    message:
      "Display name can only contain letters, numbers, spaces, hyphens, and underscores",
  })
  displayName?: string;
}
