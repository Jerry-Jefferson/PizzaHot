import { Module } from "@nestjs/common";
import { IngredientsService } from "./ingredients.service.ts";
import { IngredientsController } from "./ingredients.controller.ts";

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
