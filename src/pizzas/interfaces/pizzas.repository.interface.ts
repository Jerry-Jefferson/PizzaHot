import type { Pizza } from "../entities/pizza.entity.ts";

export interface IPizzasRepository {
  create(data: Partial<Pizza>): Pizza;
  save(pizza: Pizza): Promise<Pizza>;
  findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: Pizza[]; total: number }>;
  findById(id: string): Promise<Pizza | null>;
  findByName(name: string): Promise<Pizza | null>;
  update(id: string, data: Partial<Pizza>): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  deleteNotOrderedMonth(cutoffDate?: Date): Promise<number>;
  createWithIngredients(createData: Partial<Pizza>, ingredientIds?: string[]): Promise<Pizza>;
  updateWithIngredients(
    id: string,
    updateData: Partial<Pizza>,
    ingredientIds?: string[]
  ): Promise<void>;
}
