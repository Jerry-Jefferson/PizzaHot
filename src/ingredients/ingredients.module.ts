import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IngredientsService } from "./ingredients.service.ts";
import { IngredientsController } from "./ingredients.controller.ts";
import { IngredientsRepository } from "./ingredients.repository.ts";
import { Ingredient } from "./entities/ingredient.entity.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient])],
  controllers: [IngredientsController],
  providers: [IngredientsService, IngredientsRepository],
  exports: [IngredientsService],
})
export class IngredientsModule {}
