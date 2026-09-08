import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PizzasModule } from "../pizzas/pizzas.module.ts";
import { PromocodesModule } from "../promocodes/promocodes.module.ts";
import { Cart } from "./entities/cart.entity.ts";
import { CartItem } from "./entities/cart-item.entity.ts";
import { CartController } from "./carts.controller.ts";
import { CartRepository } from "./carts.repository.ts";
import { CartItemsRepository } from "./cart-items.repository.ts";
import { CartService } from "./carts.service.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), PizzasModule, PromocodesModule],
  controllers: [CartController],
  providers: [CartService, CartRepository, CartItemsRepository],
  exports: [CartService],
})
export class CartModule {}
