import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule, type JwtModuleOptions } from "@nestjs/jwt";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import {
  ANALYTICS_CLIENT,
  CART_CLIENT,
  CATALOG_CLIENT,
  IDENTITY_CLIENT,
  LOG_CLIENT,
  ORDER_CLIENT,
  PROMOCODE_CLIENT,
} from "../../libs/messaging/tokens.constant.ts";
import { JwtAuthGuard } from "../../libs/auth/guards/jwt-auth.guard.ts";
import { PermissionsGuard } from "../../libs/auth/guards/permissions.guard.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { HttpLoggingInterceptor } from "../../libs/logging/http-logging.interceptor.ts";
import { CriticalErrorFilter } from "../../libs/logging/critical-error.filter.ts";
import { AppService } from "./app.service.ts";
import { AppController } from "./controllers/app.controller.ts";
import { AuthController } from "./controllers/auth.controller.ts";
import { UsersController } from "./controllers/users.controller.ts";
import { PizzasController } from "./controllers/pizzas.controller.ts";
import { IngredientsController } from "./controllers/ingredients.controller.ts";
import { CartController } from "./controllers/carts.controller.ts";
import { OrdersController } from "./controllers/orders.controller.ts";
import { PromocodesController } from "./controllers/promocodes.controller.ts";
import { AnalyticsController } from "./controllers/analytics.controller.ts";
import { LogsController } from "./controllers/logs.controller.ts";
import { IdentityClient } from "./clients/identity.client.ts";
import { CatalogClient } from "./clients/catalog.client.ts";
import { CartClient } from "./clients/cart.client.ts";
import { OrderClient } from "./clients/order.client.ts";
import { PromocodeClient } from "./clients/promocode.client.ts";
import { AnalyticsClient, LogClient } from "./clients/analytics.client.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          secret: configService.getOrThrow<string>("JWT_SECRET"),
          signOptions: { expiresIn: configService.get<string>("JWT_EXPIRATION") ?? "1d" },
        }) as JwtModuleOptions,
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
export class GatewayModule {}
