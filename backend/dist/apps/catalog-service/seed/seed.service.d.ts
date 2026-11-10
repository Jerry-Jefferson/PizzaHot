import { OnModuleInit } from "@nestjs/common";
import { IngredientsService } from "../ingredients/ingredients.service.ts";
import { PizzasService } from "../pizzas/pizzas.service.ts";
export declare class SeedService implements OnModuleInit {
    private readonly ingredients;
    private readonly pizzas;
    private readonly logger;
    constructor(ingredients: IngredientsService, pizzas: PizzasService);
    onModuleInit(): Promise<void>;
    private seedIngredients;
    private seedPizzas;
}
