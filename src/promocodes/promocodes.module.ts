import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Promocode } from "./entities/promocode.entity.ts";
import { PromocodesController } from "./promocodes.controller.ts";
import { PromocodesRepository } from "./promocodes.repository.ts";
import { PromocodesService } from "./promocodes.service.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Promocode])],
  controllers: [PromocodesController],
  providers: [PromocodesService, PromocodesRepository],
  exports: [PromocodesService],
})
export class PromocodesModule { }
