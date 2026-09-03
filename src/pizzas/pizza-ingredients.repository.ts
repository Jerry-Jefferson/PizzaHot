import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PizzaIngredient } from "./entities/pizza-ingredient.entity.ts";

@Injectable()
export class PizzaIngredientsRepository {
  constructor(
    @InjectRepository(PizzaIngredient)
    private readonly repository: Repository<PizzaIngredient>
  ) {}

  createMany(pizzaId: string, ingredientIds: string[]): PizzaIngredient[] {
    return ingredientIds.map((ingredientId) =>
      this.repository.create({
        pizza: { id: pizzaId },
        ingredient: { id: ingredientId },
      })
    );
  }

  async saveMany(entities: PizzaIngredient[]): Promise<PizzaIngredient[]> {
    return this.repository.save(entities);
  }

  async deleteByPizzaId(pizzaId: string): Promise<void> {
    await this.repository.delete({ pizza: { id: pizzaId } });
  }
}
