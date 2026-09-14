import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IngredientsRepository } from "./ingredients.repository.ts";
import { Ingredient } from "./entities/ingredient.entity.ts";
import { CreateIngredientDto } from "./dto/create-ingredient.dto.ts";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto.ts";

@Injectable()
export class IngredientsService {
  private readonly logger = new Logger(IngredientsService.name);

  constructor(private readonly ingredientsRepository: IngredientsRepository) {}

  async create(dto: CreateIngredientDto): Promise<Ingredient> {
    const existing = await this.ingredientsRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException("Ingredient with this name already exists");
    }

    const ingredient = this.ingredientsRepository.create(dto);
    const saved = await this.ingredientsRepository.save(ingredient);
    this.logger.log(`Ingredient created: "${saved.name}" (id: ${saved.id})`);
    return saved;
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

  async validateIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const found = await this.ingredientsRepository.findByIds(ids);
    if (found.length !== ids.length) {
      const foundIds = new Set(found.map((i) => i.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Ingredients not found: ${missing.join(", ")}`);
    }
  }

  async update(id: string, dto: UpdateIngredientDto): Promise<Ingredient> {
    await this.findById(id);

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
    const ingredient = await this.findById(id);
    const deleted = await this.ingredientsRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException("Ingredient not found");
    }
    this.logger.log(`Ingredient deleted: "${ingredient.name}" (id: ${id})`);
  }
}
