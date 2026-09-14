import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, ILike, Repository } from "typeorm";
import { Pizza } from "./entities/pizza.entity.ts";
import { PizzaIngredient } from "./entities/pizza-ingredient.entity.ts";
import type { IPizzasRepository } from "./interfaces/pizzas.repository.interface.ts";

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

  async deleteNotOrderedMonth(
    cutoffDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(Pizza)
      .where(
        `id NOT IN (
          SELECT oi.pizza_id
          FROM order_items oi
          INNER JOIN orders o ON o.id = oi.order_id
          WHERE oi.pizza_id IS NOT NULL
            AND o."createdAt" >= :cutoffDate
        )`,
        { cutoffDate }
      )
      .execute();

    return result.affected ?? 0;
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
