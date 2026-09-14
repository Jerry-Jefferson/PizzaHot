import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller.ts";
import { OrdersService } from "./orders.service.ts";
import { CartModule } from "../carts/carts.module.ts";
import { PromocodesModule } from "../promocodes/promocodes.module.ts";
import { UsersModule } from "../users/users.module.ts";

@Module({
  imports: [CartModule, PromocodesModule, UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
