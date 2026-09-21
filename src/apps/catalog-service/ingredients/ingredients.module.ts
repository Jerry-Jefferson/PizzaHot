import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ingredient } from "./ingredient.entity.ts";
import { IngredientsRepository } from "./ingredients.repository.ts";
import { IngredientsService } from "./ingredients.service.ts";
import { INGREDIENTS_REPOSITORY } from "../../../libs/database/tokens.ts";

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient])],
  providers: [
    IngredientsRepository,
    { provide: INGREDIENTS_REPOSITORY, useExisting: IngredientsRepository },
    IngredientsService,
  ],
  exports: [IngredientsService],
})
export class IngredientsModule {}
