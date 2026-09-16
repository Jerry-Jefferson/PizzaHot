import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity.ts";
import { OrderItem } from "./entities/order-item.entity.ts";
import { OrdersRepository } from "./orders.repository.ts";
import { OrderItemsRepository } from "./order-items.repository.ts";
import { OrdersService } from "./orders.service.ts";
import { ORDERS_REPOSITORY, ORDER_ITEMS_REPOSITORY } from "../../../libs/common/database/tokens.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  providers: [
    OrdersRepository,
    { provide: ORDERS_REPOSITORY, useExisting: OrdersRepository },
    OrderItemsRepository,
    { provide: ORDER_ITEMS_REPOSITORY, useExisting: OrderItemsRepository },
    OrdersService,
  ],
  exports: [OrdersService, ORDERS_REPOSITORY],
})
export class OrdersModule {}
