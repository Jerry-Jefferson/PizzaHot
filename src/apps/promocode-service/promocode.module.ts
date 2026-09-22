import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/database/typeorm.config.ts";
import { PROMOCODES_REPOSITORY } from "../../libs/database/tokens.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { Promocode } from "./promocode.entity.ts";
import { PromocodeRedemption } from "./redemptions/promocode-redemption.entity.ts";
import { PromocodesRepository } from "./promocodes.repository.ts";
import { PromocodesService } from "./promocodes.service.ts";
import { RedemptionsModule } from "./redemptions/redemptions.module.ts";
import { PromocodeMessagesController } from "./promocode.controller.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig("promo_db", [Promocode, PromocodeRedemption])),
    TypeOrmModule.forFeature([Promocode]),
    MessagingModule.register([]),
    RedemptionsModule,
  ],
  controllers: [PromocodeMessagesController],
  providers: [
    PromocodesRepository,
    { provide: PROMOCODES_REPOSITORY, useExisting: PromocodesRepository },
    PromocodesService,
    RmqLoggerService,
  ],
})
export class PromocodeServiceModule {}
