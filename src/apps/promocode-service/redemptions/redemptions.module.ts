import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PromocodeRedemption } from "./entities/promocode-redemption.entity.ts";
import { RedemptionsRepository } from "./redemptions.repository.ts";
import { RedemptionsService } from "./redemptions.service.ts";
import { REDEMPTIONS_REPOSITORY } from "../../../libs/common/database/tokens.ts";

@Module({
  imports: [TypeOrmModule.forFeature([PromocodeRedemption])],
  providers: [
    RedemptionsRepository,
    { provide: REDEMPTIONS_REPOSITORY, useExisting: RedemptionsRepository },
    RedemptionsService,
  ],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
