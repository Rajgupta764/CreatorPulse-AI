import { Module } from "@nestjs/common";
import { RepurposeController } from "./repurpose.controller";
import { RepurposeService } from "./repurpose.service";

@Module({
  controllers: [RepurposeController],
  providers: [RepurposeService],
})
export class RepurposeModule {}
