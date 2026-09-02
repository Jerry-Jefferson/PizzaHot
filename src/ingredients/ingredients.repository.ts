import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Ingredient } from "./entities/ingredient.entity.ts";

@Injectable()
export class IngredientsRepository {
  constructor(
    @InjectRepository(Ingredient)
    private readonly repository: Repository<Ingredient>
  ) {}

  create(data: Partial<Ingredient>): Ingredient {
    return this.repository.create(data);
  }

  async save(ingredient: Ingredient): Promise<Ingredient> {
    return this.repository.save(ingredient);
  }

  async findAll(): Promise<Ingredient[]> {
    return this.repository.find();
  }


  async findById(id: string): Promise<Ingredient | null> {
    return this.repository.findOneBy({ id });
  }

  async findByName(name: string): Promise<Ingredient | null> {
    return this.repository.findOne({ where: { name } });
  }

  async update(id: string, data: Partial<Ingredient>): Promise<Ingredient | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
