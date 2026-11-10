var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/database/typeorm.config.js";
import { PROMOCODES_REPOSITORY } from "../../libs/database/tokens.js";
import { MessagingModule } from "../../libs/messaging/messaging.module.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { Promocode } from "./promocode.entity.js";
import { PromocodeRedemption } from "./redemptions/promocode-redemption.entity.js";
import { PromocodesRepository } from "./promocodes.repository.js";
import { PromocodesService } from "./promocodes.service.js";
import { RedemptionsModule } from "./redemptions/redemptions.module.js";
import { PromocodeMessagesController } from "./promocode.controller.js";
let PromocodeServiceModule = class PromocodeServiceModule {
};
PromocodeServiceModule = __decorate([
    Module({
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
], PromocodeServiceModule);
export { PromocodeServiceModule };
//# sourceMappingURL=promocode.module.js.map