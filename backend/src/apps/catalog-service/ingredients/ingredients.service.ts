import { ConflictException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { INGREDIENTS_REPOSITORY } from "../../../libs/database/tokens.ts";
import type { IIngredientsRepository } from "./ingredient.types.ts";
import { CreateIngredientDto } from "./dto/create-ingredient.dto.ts";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto.ts";
import { IngredientResponseDto } from "./dto/ingredient-response.dto.ts";

@Injectable()
export class IngredientsService {
  private readonly logger = new Logger(IngredientsService.name);

  constructor(
    @Inject(INGREDIENTS_REPOSITORY)
    private readonly ingredientsRepository: IIngredientsRepository
  ) {}

  async create(dto: CreateIngredientDto): Promise<IngredientResponseDto> {
    const existing = await this.ingredientsRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException("Ingredient with this name already exists");
    }

    const ingredient = this.ingredientsRepository.create(dto);
    const saved = await this.ingredientsRepository.save(ingredient);
    this.logger.log(`Ingredient created: "${saved.name}" (id: ${saved.id})`);
    return IngredientResponseDto.fromEntity(saved);
  }

  async findAll(): Promise<IngredientResponseDto[]> {
    return IngredientResponseDto.fromEntities(await this.ingredientsRepository.findAll());
  }

  async findById(id: string): Promise<IngredientResponseDto> {
    const ingredient = await this.ingredientsRepository.findById(id);
    if (!ingredient) {
      throw new NotFoundException("Ingredient not found");
    }

    return IngredientResponseDto.fromEntity(ingredient);
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

  async update(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto> {
    await this.findById(id);

    const existing = await this.ingredientsRepository.findByName(dto.name);
    if (existing && existing.id !== id) {
      throw new ConflictException("Ingredient with this name already exists");
    }

    const ingredient = await this.ingredientsRepository.update(id, dto);
    if (!ingredient) {
      throw new NotFoundException("Ingredient not found");
    }

    return IngredientResponseDto.fromEntity(ingredient);
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
