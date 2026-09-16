import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "./entities/cart.entity.ts";
import { CartItem } from "./entities/cart-item.entity.ts";
import { CartRepository } from "./carts.repository.ts";
import { CartItemsRepository } from "./cart-items.repository.ts";
import { CartService } from "./carts.service.ts";
import { SnapshotsModule } from "../snapshots/snapshots.module.ts";
import { CART_REPOSITORY, CART_ITEMS_REPOSITORY } from "../../../libs/common/database/tokens.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), SnapshotsModule],
  providers: [
    CartRepository,
    { provide: CART_REPOSITORY, useExisting: CartRepository },
    CartItemsRepository,
    { provide: CART_ITEMS_REPOSITORY, useExisting: CartItemsRepository },
    CartService,
  ],
  exports: [CartService],
})
export class CartModule {}
