import { type Relation } from "typeorm";
import type { Pizza } from "./pizza.entity.ts";
import type { Ingredient } from "../ingredients/ingredient.entity.ts";
export declare class PizzaIngredient {
    id: string;
    pizza: Relation<Pizza>;
    ingredient: Relation<Ingredient>;
}
