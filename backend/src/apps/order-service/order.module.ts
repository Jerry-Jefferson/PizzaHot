import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/database/typeorm.config.ts";
import { ORDERS_REPOSITORY, ORDER_ITEMS_REPOSITORY } from "../../libs/database/tokens.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import {
  CART_CLIENT,
  CATALOG_CLIENT,
  PROMOCODE_CLIENT,
} from "../../libs/messaging/tokens.constant.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { Order } from "./order.entity.ts";
import { OrderItem } from "./order-items/order-item.entity.ts";
import { OrdersRepository } from "./orders.repository.ts";
import { OrderItemsRepository } from "./order-items/order-items.repository.ts";
import { OrdersService } from "./orders.service.ts";
import { OrderMessagesController } from "./order.controller.ts";

const ENTITIES = [Order, OrderItem];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig("order_db", ENTITIES)),
    TypeOrmModule.forFeature(ENTITIES),
    MessagingModule.register([CART_CLIENT, CATALOG_CLIENT, PROMOCODE_CLIENT]),
  ],
  controllers: [OrderMessagesController],
  providers: [
    OrdersRepository,
    { provide: ORDERS_REPOSITORY, useExisting: OrdersRepository },
    OrderItemsRepository,
    { provide: ORDER_ITEMS_REPOSITORY, useExisting: OrderItemsRepository },
    OrdersService,
    RmqLoggerService,
  ],
})
export class OrderServiceModule {}
