var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/database/typeorm.config.js";
import { ANALYTICS_REPOSITORY } from "../../libs/database/tokens.js";
import { MessagingModule } from "../../libs/messaging/messaging.module.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { OrderFact } from "./entities/order-fact.entity.js";
import { OrderItemFact } from "./entities/order-item-fact.entity.js";
import { UserFact } from "./entities/user-fact.entity.js";
import { AnalyticsReadModelRepository } from "./analytics.repository.js";
import { AnalyticsService } from "./analytics.service.js";
import { AnalyticsMessagesController } from "./analytics.controller.js";
const ENTITIES = [OrderFact, OrderItemFact, UserFact];
let AnalyticsServiceModule = class AnalyticsServiceModule {
};
AnalyticsServiceModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            TypeOrmModule.forRoot(typeOrmConfig("analytics_db", ENTITIES)),
            TypeOrmModule.forFeature(ENTITIES),
            MessagingModule.register([]),
        ],
        controllers: [AnalyticsMessagesController],
        providers: [
            AnalyticsReadModelRepository,
            { provide: ANALYTICS_REPOSITORY, useExisting: AnalyticsReadModelRepository },
            AnalyticsService,
            RmqLoggerService,
        ],
    })
], AnalyticsServiceModule);
export { AnalyticsServiceModule };
//# sourceMappingURL=analytics.module.js.map