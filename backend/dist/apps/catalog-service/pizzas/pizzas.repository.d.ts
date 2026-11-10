import { DataSource, Repository } from "typeorm";
import { Pizza } from "./pizza.entity.ts";
import type { IPizzasRepository } from "./pizza.types.ts";
import type { PaginatedResult } from "../../../libs/pagination/pagination.types.ts";
export declare class PizzasRepository implements IPizzasRepository {
    private readonly repository;
    private readonly dataSource;
    constructor(repository: Repository<Pizza>, dataSource: DataSource);
    create(data: Partial<Pizza>): Pizza;
    save(pizza: Pizza): Promise<Pizza>;
    findPaginated(page: number, limit: number, search?: string): Promise<PaginatedResult<Pizza>>;
    findById(id: string): Promise<Pizza | null>;
    findByIds(ids: string[]): Promise<Pizza[]>;
    findByName(name: string): Promise<Pizza | null>;
    update(id: string, data: Partial<Pizza>): Promise<boolean>;
    remove(id: string): Promise<boolean>;
    deleteNotOrderedSince(cutoffDate: Date): Promise<number>;
    markOrdered(pizzaIds: string[], orderedAt: Date): Promise<void>;
    createWithIngredients(createData: Partial<Pizza>, ingredientIds?: string[]): Promise<Pizza>;
    updateWithIngredients(id: string, updateData: Partial<Pizza>, ingredientIds?: string[]): Promise<void>;
}
