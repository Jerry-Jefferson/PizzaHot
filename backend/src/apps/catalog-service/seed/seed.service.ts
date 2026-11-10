import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { IngredientsService } from "../ingredients/ingredients.service.ts";
import { PizzasService } from "../pizzas/pizzas.service.ts";
import { SEED_INGREDIENTS, SEED_PIZZAS } from "./seed.data.ts";

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly ingredients: IngredientsService,
    private readonly pizzas: PizzasService
  ) {}

  async onModuleInit(): Promise<void> {
    const ingredientIdsByName = await this.seedIngredients();
    await this.seedPizzas(ingredientIdsByName);
  }

  private async seedIngredients(): Promise<Map<string, string>> {
    const existing = await this.ingredients.findAll();
    const byName = new Map(existing.map((ingredient) => [ingredient.name, ingredient.id]));

    let created = 0;
    for (const name of SEED_INGREDIENTS) {
      if (byName.has(name)) continue;

      const ingredient = await this.ingredients.create({ name });
      byName.set(ingredient.name, ingredient.id);
      created += 1;
    }

    this.logger.log(
      created === 0
        ? `All ${SEED_INGREDIENTS.length} seed ingredients already present`
        : `Seeded ${created} ingredients (${existing.length} were already there)`
    );

    return byName;
  }

  private async seedPizzas(ingredientIdsByName: Map<string, string>): Promise<void> {
    const { total } = await this.pizzas.findAll(1, 1);

    if (total > 0) {
      this.logger.log(`Pizzas already present (${total}), skipping seed`);
      return;
    }

    let seeded = 0;
    for (const pizza of SEED_PIZZAS) {
      const ingredientIds = pizza.ingredients.map((name) => ingredientIdsByName.get(name));

      if (ingredientIds.some((id) => id === undefined)) {
        const missing = pizza.ingredients.filter((name) => !ingredientIdsByName.has(name));
        this.logger.warn(`Skipping "${pizza.name}": unknown ingredients ${missing.join(", ")}`);
        continue;
      }

      await this.pizzas.create({
        name: pizza.name,
        description: pizza.description,
        price: pizza.price,
        ingredientIds: ingredientIds.filter((id): id is string => id !== undefined),
      });
      seeded += 1;
    }

    this.logger.log(`Seeded ${seeded} pizzas`);
  }
}
