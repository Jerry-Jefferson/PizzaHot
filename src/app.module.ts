import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller.ts";
import { AppService } from "./app.service.ts";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module.ts";
import { SeedService } from "./shared/seed/seed.service.ts";
import { UsersModule } from "./users/users.module.ts";
import { PizzasModule } from "./pizzas/pizzas.module.ts";
import { IngredientsModule } from "./ingredients/ingredients.module.ts";
import { CartModule } from "./carts/carts.module.ts";
import { PromocodesModule } from "./promocodes/promocodes.module.ts";
import { OrdersModule } from "./orders/orders.module.ts";
import { AnalyticsModule } from "./analytics/analytics.module.ts";
import { NotificationsModule } from "./notifications/notifications.module.ts";
import { CriticalErrorFilter } from "./notifications/filters/critical-error.filter.ts";
import { LogsModule } from "./logs/logs.module.ts";
import { HttpLoggingInterceptor } from "./logs/interceptors/http-logging.interceptor.ts";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("POSTGRES_HOST"),
        port: configService.get<number>("POSTGRES_PORT"),
        username: configService.get<string>("POSTGRES_USER"),
        password: configService.get<string>("POSTGRES_PASSWORD"),
        database: configService.get<string>("POSTGRES_DB"),
        autoLoadEntities: true,
        synchronize: configService.get<string>("NODE_ENV") !== "production",
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const user = configService.get<string>("MONGO_INITDB_ROOT_USERNAME");
        const password = configService.get<string>("MONGO_INITDB_ROOT_PASSWORD");
        const host = configService.get<string>("MONGO_HOST");
        const port = configService.get<number>("MONGO_PORT");
        const db = configService.get<string>("MONGO_INITDB_DATABASE");

        return {
          uri: `mongodb://${user}:${password}@${host}:${port}/${db}?authSource=admin`,
        };
      },
    }),
    AuthModule,
    UsersModule,
    PizzasModule,
    IngredientsModule,
    CartModule,
    PromocodesModule,
    OrdersModule,
    AnalyticsModule,
    NotificationsModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: CriticalErrorFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})
export class AppModule {}
