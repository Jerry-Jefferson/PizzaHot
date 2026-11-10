var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/database/typeorm.config.js";
import { CART_ITEMS_REPOSITORY, CART_REPOSITORY } from "../../libs/database/tokens.js";
import { MessagingModule } from "../../libs/messaging/messaging.module.js";
import { PROMOCODE_CLIENT } from "../../libs/messaging/tokens.constant.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { Cart } from "./cart.entity.js";
import { CartItem } from "./cart-items/cart-item.entity.js";
import { PizzaSnapshot } from "./snapshots/pizza-snapshot.entity.js";
import { CartRepository } from "./carts.repository.js";
import { CartItemsRepository } from "./cart-items/cart-items.repository.js";
import { CartService } from "./carts.service.js";
import { SnapshotsModule } from "./snapshots/snapshots.module.js";
import { CartMessagesController } from "./cart.controller.js";
let CartServiceModule = class CartServiceModule {
};
CartServiceModule = __decorate([
    Module({
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
], CartServiceModule);
export { CartServiceModule };
//# sourceMappingURL=cart.module.js.map