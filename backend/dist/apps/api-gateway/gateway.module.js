var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { MessagingModule } from "../../libs/messaging/messaging.module.js";
import { ANALYTICS_CLIENT, CART_CLIENT, CATALOG_CLIENT, IDENTITY_CLIENT, LOG_CLIENT, ORDER_CLIENT, PROMOCODE_CLIENT, } from "../../libs/messaging/tokens.constant.js";
import { JwtAuthGuard } from "../../libs/auth/guards/jwt-auth.guard.js";
import { PermissionsGuard } from "../../libs/auth/guards/permissions.guard.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { HttpLoggingInterceptor } from "../../libs/logging/http-logging.interceptor.js";
import { CriticalErrorFilter } from "../../libs/logging/critical-error.filter.js";
import { AppService } from "./app.service.js";
import { AppController } from "./app.controller.js";
import { AuthController } from "./controllers/auth/auth.controller.js";
import { UsersController } from "./controllers/users/users.controller.js";
import { PizzasController } from "./controllers/pizzas/pizzas.controller.js";
import { IngredientsController } from "./controllers/ingredients/ingredients.controller.js";
import { CartController } from "./controllers/carts/carts.controller.js";
import { OrdersController } from "./controllers/orders/orders.controller.js";
import { PromocodesController } from "./controllers/promocodes/promocodes.controller.js";
import { AnalyticsController } from "./controllers/analytics/analytics.controller.js";
import { LogsController } from "./controllers/logs/logs.controller.js";
import { IdentityClient } from "./clients/identity.client.js";
import { CatalogClient } from "./clients/catalog.client.js";
import { CartClient } from "./clients/cart.client.js";
import { OrderClient } from "./clients/order.client.js";
import { PromocodeClient } from "./clients/promocode.client.js";
import { AnalyticsClient, LogClient } from "./clients/analytics.client.js";
let GatewayModule = class GatewayModule {
};
GatewayModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
            JwtModule.registerAsync({
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService) => ({
                    secret: configService.getOrThrow("JWT_SECRET"),
                    signOptions: { expiresIn: configService.get("JWT_EXPIRATION") ?? "1d" },
                }),
            }),
            MessagingModule.register([
                IDENTITY_CLIENT,
                CATALOG_CLIENT,
                CART_CLIENT,
                ORDER_CLIENT,
                PROMOCODE_CLIENT,
                ANALYTICS_CLIENT,
                LOG_CLIENT,
            ]),
        ],
        controllers: [
            AppController,
            AuthController,
            UsersController,
            PizzasController,
            IngredientsController,
            CartController,
            OrdersController,
            PromocodesController,
            AnalyticsController,
            LogsController,
        ],
        providers: [
            AppService,
            RmqLoggerService,
            IdentityClient,
            CatalogClient,
            CartClient,
            OrderClient,
            PromocodeClient,
            AnalyticsClient,
            LogClient,
            { provide: APP_GUARD, useClass: ThrottlerGuard },
            { provide: APP_GUARD, useClass: JwtAuthGuard },
            { provide: APP_GUARD, useClass: PermissionsGuard },
            { provide: APP_FILTER, useClass: CriticalErrorFilter },
            { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
        ],
    })
], GatewayModule);
export { GatewayModule };
//# sourceMappingURL=gateway.module.js.map