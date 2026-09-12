import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IngredientsModule } from "../ingredients/ingredients.module.ts";
import { Pizza } from "./entities/pizza.entity.ts";
import { PizzaIngredient } from "./entities/pizza-ingredient.entity.ts";
import { PizzasController } from "./pizzas.controller.ts";
import { PizzasRepository } from "./pizzas.repository.ts";
import { PizzaIngredientsRepository } from "./pizza-ingredients.repository.ts";
import { PizzasService } from "./pizzas.service.ts";
import { PizzaCleanupService } from "./pizza-cleanup.service.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Pizza, PizzaIngredient]), IngredientsModule],
  controllers: [PizzasController],
  providers: [PizzasService, PizzasRepository, PizzaIngredientsRepository, PizzaCleanupService],
  exports: [PizzasService, PizzaCleanupService],
})
export class PizzasModule {}
