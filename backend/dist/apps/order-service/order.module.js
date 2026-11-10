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
import { ORDERS_REPOSITORY, ORDER_ITEMS_REPOSITORY } from "../../libs/database/tokens.js";
import { MessagingModule } from "../../libs/messaging/messaging.module.js";
import { CART_CLIENT, CATALOG_CLIENT, PROMOCODE_CLIENT, } from "../../libs/messaging/tokens.constant.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { Order } from "./order.entity.js";
import { OrderItem } from "./order-items/order-item.entity.js";
import { OrdersRepository } from "./orders.repository.js";
import { OrderItemsRepository } from "./order-items/order-items.repository.js";
import { OrdersService } from "./orders.service.js";
import { OrderMessagesController } from "./order.controller.js";
const ENTITIES = [Order, OrderItem];
let OrderServiceModule = class OrderServiceModule {
};
OrderServiceModule = __decorate([
    Module({
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
], OrderServiceModule);
export { OrderServiceModule };
//# sourceMappingURL=order.module.js.map