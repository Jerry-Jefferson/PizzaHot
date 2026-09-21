import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, ILike, In, Repository } from "typeorm";
import { Pizza } from "./pizza.entity.ts";
import { PizzaIngredient } from "./pizza-ingredient.entity.ts";
import type { IPizzasRepository } from "./pizza.types.ts";

@Injectable()
export class PizzasRepository implements IPizzasRepository {
  constructor(
    @InjectRepository(Pizza)
    private readonly repository: Repository<Pizza>,
    private readonly dataSource: DataSource
  ) {}

  create(data: Partial<Pizza>): Pizza {
    return this.repository.create(data);
  }

  async save(pizza: Pizza): Promise<Pizza> {
    return this.repository.save(pizza);
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: Pizza[]; total: number }> {
    const where = search ? { name: ILike(`%${search.replace(/[%_]/g, "\\$&")}%`) } : {};

    const [data, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
      relations: {
        pizzaIngredients: {
          ingredient: true,
        },
      },
    });
    return { data, total };
  }

  async findById(id: string): Promise<Pizza | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        pizzaIngredients: {
          ingredient: true,
        },
      },
    });
  }

  async findByIds(ids: string[]): Promise<Pizza[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.repository.find({ where: { id: In(ids) } });
  }

  async findByName(name: string): Promise<Pizza | null> {
    return this.repository.findOne({
      where: { name },
      relations: {
        pizzaIngredients: {
          ingredient: true,
        },
      },
    });
  }

  async update(id: string, data: Partial<Pizza>): Promise<boolean> {
    const result = await this.repository.update(id, data);
    return (result.affected ?? 0) > 0;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteNotOrderedSince(cutoffDate: Date): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(Pizza)
      .where("lastOrderedAt IS NULL AND createdAt < :cutoffDate", { cutoffDate })
      .orWhere("lastOrderedAt < :cutoffDate", { cutoffDate })
      .execute();

    return result.affected ?? 0;
  }

  async markOrdered(pizzaIds: string[], orderedAt: Date): Promise<void> {
    if (pizzaIds.length === 0) {
      return;
    }

    await this.repository
      .createQueryBuilder()
      .update(Pizza)
      .set({ lastOrderedAt: orderedAt })
      .where("id IN (:...pizzaIds)", { pizzaIds })
      .andWhere("(lastOrderedAt IS NULL OR lastOrderedAt < :orderedAt)", { orderedAt })
      .execute();
  }

  async createWithIngredients(
    createData: Partial<Pizza>,
    ingredientIds?: string[]
  ): Promise<Pizza> {
    return this.dataSource.transaction(async (manager) => {
      const pizza = manager.create(Pizza, createData);
      const saved = await manager.save(pizza);

      if (ingredientIds && ingredientIds.length > 0) {
        const entities = ingredientIds.map((ingredientId) =>
          manager.create(PizzaIngredient, {
            pizza: { id: saved.id },
            ingredient: { id: ingredientId },
          })
        );
        await manager.save(entities);
      }

      return saved;
    });
  }

  async updateWithIngredients(
    id: string,
    updateData: Partial<Pizza>,
    ingredientIds?: string[]
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      if (Object.keys(updateData).length > 0) {
        await manager.update(Pizza, id, updateData);
      }

      if (ingredientIds) {
        await manager.delete(PizzaIngredient, { pizza: { id } });
        if (ingredientIds.length > 0) {
          const entities = ingredientIds.map((ingredientId) =>
            manager.create(PizzaIngredient, {
              pizza: { id },
              ingredient: { id: ingredientId },
            })
          );
          await manager.save(entities);
        }
      }
    });
  }
}
