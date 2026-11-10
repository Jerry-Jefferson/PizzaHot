var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "../../libs/database/typeorm.config.js";
import { MessagingModule } from "../../libs/messaging/messaging.module.js";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.js";
import { Pizza } from "./pizzas/pizza.entity.js";
import { PizzaIngredient } from "./pizzas/pizza-ingredient.entity.js";
import { Ingredient } from "./ingredients/ingredient.entity.js";
import { PizzasModule } from "./pizzas/pizzas.module.js";
import { IngredientsModule } from "./ingredients/ingredients.module.js";
import { CatalogMessagesController } from "./catalog.controller.js";
import { SeedService } from "./seed/seed.service.js";
let CatalogServiceModule = class CatalogServiceModule {
};
CatalogServiceModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            ScheduleModule.forRoot(),
            TypeOrmModule.forRoot(typeOrmConfig("catalog_db", [Pizza, PizzaIngredient, Ingredient])),
            MessagingModule.register([]),
            PizzasModule,
            IngredientsModule,
        ],
        controllers: [CatalogMessagesController],
        providers: [RmqLoggerService, SeedService],
    })
], CatalogServiceModule);
export { CatalogServiceModule };
//# sourceMappingURL=catalog.module.js.map