import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/common/database/typeorm.config.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { Promocode } from "./promocodes/entities/promocode.entity.ts";
import { PromocodeRedemption } from "./redemptions/entities/promocode-redemption.entity.ts";
import { PromocodesModule } from "./promocodes/promocodes.module.ts";
import { RedemptionsModule } from "./redemptions/redemptions.module.ts";
import { PromocodeMessagesController } from "./promocode.messages.controller.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig("promo_db", [Promocode, PromocodeRedemption])),
    MessagingModule.register([]),
    PromocodesModule,
    RedemptionsModule,
  ],
  controllers: [PromocodeMessagesController],
  providers: [RmqLoggerService],
})
export class PromocodeServiceModule {}
