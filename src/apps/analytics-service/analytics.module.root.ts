import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/common/database/typeorm.config.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { OrderFact } from "./readmodel/entities/order-fact.entity.ts";
import { OrderItemFact } from "./readmodel/entities/order-item-fact.entity.ts";
import { UserFact } from "./readmodel/entities/user-fact.entity.ts";
import { AnalyticsModule } from "./analytics/analytics.module.ts";
import { AnalyticsMessagesController } from "./analytics.messages.controller.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig("analytics_db", [OrderFact, OrderItemFact, UserFact])),
    MessagingModule.register([]),
    AnalyticsModule,
  ],
  controllers: [AnalyticsMessagesController],
  providers: [RmqLoggerService],
})
export class AnalyticsServiceModule {}
