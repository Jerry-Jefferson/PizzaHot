import { Pizza } from "../pizza.entity.ts";
import { IngredientResponseDto } from "../../ingredients/dto/ingredient-response.dto.ts";
export declare class PizzaResponseDto {
    id: string;
    name: string;
    description: string;
    image?: string | null;
    price: number;
    ingredients?: IngredientResponseDto[];
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(pizza: Pizza): PizzaResponseDto;
    static fromEntities(pizzas: Pizza[]): PizzaResponseDto[];
}
