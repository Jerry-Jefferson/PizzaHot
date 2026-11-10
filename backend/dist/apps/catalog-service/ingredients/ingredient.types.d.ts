import type { Ingredient } from "./ingredient.entity.ts";
export interface IIngredientsRepository {
    create(data: Partial<Ingredient>): Ingredient;
    save(ingredient: Ingredient): Promise<Ingredient>;
    findAll(): Promise<Ingredient[]>;
    findById(id: string): Promise<Ingredient | null>;
    findByName(name: string): Promise<Ingredient | null>;
    findByIds(ids: string[]): Promise<Ingredient[]>;
    update(id: string, data: Partial<Ingredient>): Promise<Ingredient | null>;
    remove(id: string): Promise<boolean>;
}
