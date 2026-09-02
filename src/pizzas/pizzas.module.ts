import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pizza } from "./entities/pizza.entity.ts";
import { PizzasController } from "./pizzas.controller.ts";
import { PizzasRepository } from "./pizzas.repository.ts";
import { PizzasService } from "./pizzas.service.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Pizza])],
  controllers: [PizzasController],
  providers: [PizzasService, PizzasRepository],
  exports: [PizzasService],
})
export class PizzasModule {}
