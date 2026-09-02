import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { IngredientsRepository } from "./ingredients.repository.ts";
import { Ingredient } from "./entities/ingredient.entity.ts";
import { CreateIngredientDto } from "./dto/create-ingredient.dto.ts";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto.ts";

@Injectable()
export class IngredientsService {
  constructor(private readonly ingredientsRepository: IngredientsRepository) {}

  async create(dto: CreateIngredientDto): Promise<Ingredient> {
    const existing = await this.ingredientsRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException("Ingredient with this name already exists");
    }

    const ingredient = this.ingredientsRepository.create(dto);
    return this.ingredientsRepository.save(ingredient);
  }

  async findAll(): Promise<Ingredient[]> {
    return this.ingredientsRepository.findAll();
  }

  async findById(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findById(id);
    if (!ingredient) {
      throw new NotFoundException("Ingredient not found");
    }
    return ingredient;
  }

  async update(id: string, dto: UpdateIngredientDto): Promise<Ingredient> {
    if (dto.name) {
      const existing = await this.ingredientsRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException("Ingredient with this name already exists");
      }
    }

    const ingredient = await this.ingredientsRepository.update(id, dto);
    if (!ingredient) {
      throw new NotFoundException("Ingredient not found");
    }
    return ingredient;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.ingredientsRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException("Ingredient not found");
    }
  }
}
