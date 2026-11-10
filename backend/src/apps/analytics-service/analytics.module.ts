import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/database/typeorm.config.ts";
import { ANALYTICS_REPOSITORY } from "../../libs/database/tokens.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { OrderFact } from "./entities/order-fact.entity.ts";
import { OrderItemFact } from "./entities/order-item-fact.entity.ts";
import { UserFact } from "./entities/user-fact.entity.ts";
import { AnalyticsReadModelRepository } from "./analytics.repository.ts";
import { AnalyticsService } from "./analytics.service.ts";
import { AnalyticsMessagesController } from "./analytics.controller.ts";

const ENTITIES = [OrderFact, OrderItemFact, UserFact];

@Module({
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
export class AnalyticsServiceModule {}
