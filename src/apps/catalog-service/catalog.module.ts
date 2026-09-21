import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/common/database/typeorm.config.ts";
import { MessagingModule } from "../../libs/messaging/messaging.module.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { Pizza } from "./pizzas/pizza.entity.ts";
import { PizzaIngredient } from "./pizzas/pizza-ingredient.entity.ts";
import { Ingredient } from "./ingredients/ingredient.entity.ts";
import { PizzasModule } from "./pizzas/pizzas.module.ts";
import { IngredientsModule } from "./ingredients/ingredients.module.ts";
import { CatalogMessagesController } from "./catalog.controller.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig("catalog_db", [Pizza, PizzaIngredient, Ingredient])),
    MessagingModule.register([]),
    PizzasModule,
    IngredientsModule,
  ],
  controllers: [CatalogMessagesController],
  providers: [RmqLoggerService],
})
export class CatalogServiceModule {}
