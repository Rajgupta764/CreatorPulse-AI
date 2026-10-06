import { BadRequestException, ValidationPipeOptions } from "@nestjs/common";

export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) => {
    const messages = errors.map((e) => Object.values(e.constraints || {}).join(", "));
    return new BadRequestException(messages.join("; "));
  },
};
