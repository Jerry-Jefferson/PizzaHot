import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pizza } from "./entities/pizza.entity.ts";
import { PizzasRepository } from "./pizzas.repository.ts";
import { PizzasService } from "./pizzas.service.ts";
import { PizzaCleanupService } from "./pizza-cleanup.service.ts";
import { IngredientsModule } from "../ingredients/ingredients.module.ts";
import { PIZZAS_REPOSITORY } from "../../../libs/common/database/tokens.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Pizza]), IngredientsModule],
  providers: [
    PizzasRepository,
    { provide: PIZZAS_REPOSITORY, useExisting: PizzasRepository },
    PizzasService,
    PizzaCleanupService,
  ],
  exports: [PizzasService, PizzaCleanupService, PIZZAS_REPOSITORY],
})
export class PizzasModule {}
