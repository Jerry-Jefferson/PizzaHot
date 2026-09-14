import { Module } from "@nestjs/common";
import { PromocodesController } from "./promocodes.controller.ts";
import { PromocodesService } from "./promocodes.service.ts";

@Module({
  controllers: [PromocodesController],
  providers: [PromocodesService],
  exports: [PromocodesService],
})
export class PromocodesModule {}
