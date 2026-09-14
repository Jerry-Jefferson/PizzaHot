import { Module } from "@nestjs/common";
import { IngredientsModule } from "../ingredients/ingredients.module.ts";
import { NotificationsModule } from "../notifications/notifications.module.ts";
import { PizzasController } from "./pizzas.controller.ts";
import { PizzasService } from "./pizzas.service.ts";
import { PizzaCleanupService } from "./pizza-cleanup.service.ts";

@Module({
  imports: [IngredientsModule, NotificationsModule],
  controllers: [PizzasController],
  providers: [PizzasService, PizzaCleanupService],
  exports: [PizzasService, PizzaCleanupService],
})
export class PizzasModule {}
