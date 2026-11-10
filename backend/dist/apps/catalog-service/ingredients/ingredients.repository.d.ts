import { Repository } from "typeorm";
import { Ingredient } from "./ingredient.entity.ts";
import type { IIngredientsRepository } from "./ingredient.types.ts";
export declare class IngredientsRepository implements IIngredientsRepository {
    private readonly repository;
    constructor(repository: Repository<Ingredient>);
    create(data: Partial<Ingredient>): Ingredient;
    save(ingredient: Ingredient): Promise<Ingredient>;
    findAll(): Promise<Ingredient[]>;
    findById(id: string): Promise<Ingredient | null>;
    findByName(name: string): Promise<Ingredient | null>;
    findByIds(ids: string[]): Promise<Ingredient[]>;
    update(id: string, data: Partial<Ingredient>): Promise<Ingredient | null>;
    remove(id: string): Promise<boolean>;
}
