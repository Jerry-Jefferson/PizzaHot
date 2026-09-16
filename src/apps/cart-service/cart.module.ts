import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/common/database/typeorm.config.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { PROMOCODE_CLIENT } from "../../libs/messaging/tokens.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { Cart } from "./carts/entities/cart.entity.ts";
import { CartItem } from "./carts/entities/cart-item.entity.ts";
import { PizzaSnapshot } from "./snapshots/entities/pizza-snapshot.entity.ts";
import { CartModule } from "./carts/carts.module.ts";
import { SnapshotsModule } from "./snapshots/snapshots.module.ts";
import { CartMessagesController } from "./cart.messages.controller.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig("cart_db", [Cart, CartItem, PizzaSnapshot])),
    MessagingModule.register([PROMOCODE_CLIENT]),
    CartModule,
    SnapshotsModule,
  ],
  controllers: [CartMessagesController],
  providers: [RmqLoggerService],
})
export class CartServiceModule {}
