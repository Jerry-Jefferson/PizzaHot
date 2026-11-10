import { type Relation } from "typeorm";
import { PizzaIngredient } from "./pizza-ingredient.entity.ts";
export declare class Pizza {
    id: string;
    name: string;
    description: string;
    image: string | null;
    price: number;
    pizzaIngredients: Relation<PizzaIngredient[]>;
    lastOrderedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
