import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Pizza } from "./entities/pizza.entity.ts";

@Injectable()
export class PizzasRepository {
  constructor(
    @InjectRepository(Pizza)
    private readonly repository: Repository<Pizza>
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
}
