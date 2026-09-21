import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/common/database/typeorm.config.ts";
import { CART_ITEMS_REPOSITORY, CART_REPOSITORY } from "../../libs/common/database/tokens.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { PROMOCODE_CLIENT } from "../../libs/messaging/tokens.constant.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { Cart } from "./cart.entity.ts";
import { CartItem } from "./cart-items/cart-item.entity.ts";
import { PizzaSnapshot } from "./snapshots/pizza-snapshot.entity.ts";
import { CartRepository } from "./carts.repository.ts";
import { CartItemsRepository } from "./cart-items/cart-items.repository.ts";
import { CartService } from "./carts.service.ts";
import { SnapshotsModule } from "./snapshots/snapshots.module.ts";
import { CartMessagesController } from "./cart.controller.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig("cart_db", [Cart, CartItem, PizzaSnapshot])),
    TypeOrmModule.forFeature([Cart, CartItem]),
    MessagingModule.register([PROMOCODE_CLIENT]),
    SnapshotsModule,
  ],
  controllers: [CartMessagesController],
  providers: [
    CartRepository,
    { provide: CART_REPOSITORY, useExisting: CartRepository },
    CartItemsRepository,
    { provide: CART_ITEMS_REPOSITORY, useExisting: CartItemsRepository },
    CartService,
    RmqLoggerService,
  ],
})
export class CartServiceModule {}
