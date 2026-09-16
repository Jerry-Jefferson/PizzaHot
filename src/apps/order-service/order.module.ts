import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/common/database/typeorm.config.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { CART_CLIENT, CATALOG_CLIENT, PROMOCODE_CLIENT } from "../../libs/messaging/tokens.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { Order } from "./orders/entities/order.entity.ts";
import { OrderItem } from "./orders/entities/order-item.entity.ts";
import { OrdersModule } from "./orders/orders.module.ts";
import { OrderMessagesController } from "./order.messages.controller.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig("order_db", [Order, OrderItem])),
    MessagingModule.register([CART_CLIENT, CATALOG_CLIENT, PROMOCODE_CLIENT]),
    OrdersModule,
  ],
  controllers: [OrderMessagesController],
  providers: [RmqLoggerService],
})
export class OrderServiceModule {}
