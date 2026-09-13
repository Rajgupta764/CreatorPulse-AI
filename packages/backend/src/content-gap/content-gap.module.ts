import { Module } from "@nestjs/common";
import { ContentGapController } from "./content-gap.controller";
import { ContentGapService } from "./content-gap.service";

@Module({
  controllers: [ContentGapController],
  providers: [ContentGapService],
})
export class ContentGapModule {}
