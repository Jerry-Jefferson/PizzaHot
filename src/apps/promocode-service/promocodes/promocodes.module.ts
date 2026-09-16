import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Promocode } from "./entities/promocode.entity.ts";
import { PromocodesRepository } from "./promocodes.repository.ts";
import { PromocodesService } from "./promocodes.service.ts";
import { PROMOCODES_REPOSITORY } from "../../../libs/common/database/tokens.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Promocode])],
  providers: [
    PromocodesRepository,
    { provide: PROMOCODES_REPOSITORY, useExisting: PromocodesRepository },
    PromocodesService,
  ],
  exports: [PromocodesService],
})
export class PromocodesModule {}
