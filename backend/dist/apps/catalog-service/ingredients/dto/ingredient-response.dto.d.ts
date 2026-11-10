import { Ingredient } from "../ingredient.entity.ts";
export declare class IngredientResponseDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(ingredient: Ingredient): IngredientResponseDto;
    static fromEntities(ingredients: Ingredient[]): IngredientResponseDto[];
}
