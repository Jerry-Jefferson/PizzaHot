import { type Relation } from "typeorm";
import type { PizzaIngredient } from "../pizzas/pizza-ingredient.entity.ts";
export declare class Ingredient {
    id: string;
    name: string;
    pizzaIngredients: Relation<PizzaIngredient[]>;
    createdAt: Date;
    updatedAt: Date;
}
