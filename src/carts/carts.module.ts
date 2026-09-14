import { Module } from "@nestjs/common";
import { PizzasModule } from "../pizzas/pizzas.module.ts";
import { PromocodesModule } from "../promocodes/promocodes.module.ts";
import { CartController } from "./carts.controller.ts";
import { CartService } from "./carts.service.ts";

@Module({
  imports: [PizzasModule, PromocodesModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
