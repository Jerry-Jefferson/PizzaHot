import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity.ts";
import { OrderItem } from "./entities/order-item.entity.ts";
import { OrdersController } from "./orders.controller.ts";
import { OrdersService } from "./orders.service.ts";
import { OrdersRepository } from "./orders.repository.ts";
import { OrderItemsRepository } from "./order-items.repository.ts";
import { CartModule } from "../carts/carts.module.ts";
import { PromocodesModule } from "../promocodes/promocodes.module.ts";
import { UsersModule } from "../users/users.module.ts";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartModule,
    PromocodesModule,
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrderItemsRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
