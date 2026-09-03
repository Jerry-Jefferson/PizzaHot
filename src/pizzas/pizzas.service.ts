import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PizzasRepository } from "./pizzas.repository.ts";
import { PizzaIngredientsRepository } from "./pizza-ingredients.repository.ts";
import { Pizza } from "./entities/pizza.entity.ts";
import { IngredientsService } from "../ingredients/ingredients.service.ts";
import { CreatePizzaDto } from "./dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "./dto/update-pizza.dto.ts";

@Injectable()
export class PizzasService {
  constructor(
    private readonly pizzasRepository: PizzasRepository,
    private readonly pizzaIngredientsRepository: PizzaIngredientsRepository,
    private readonly ingredientsService: IngredientsService
  ) {}

  async create(dto: CreatePizzaDto): Promise<Pizza> {
    const existing = await this.pizzasRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException("Pizza with this name already exists");
    }

    if (dto.ingredientIds?.length) {
      await this.ingredientsService.validateIds(dto.ingredientIds);
    }

    const { ingredientIds, ...createData } = dto;
    const pizza = this.pizzasRepository.create(createData);
    const savedPizza = await this.pizzasRepository.save(pizza);

    if (ingredientIds && ingredientIds.length > 0) {
      const pizzaIngredients = this.pizzaIngredientsRepository.createMany(
        savedPizza.id,
        ingredientIds
      );
      await this.pizzaIngredientsRepository.saveMany(pizzaIngredients);
    }

    return this.findById(savedPizza.id);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: Pizza[]; total: number }> {
    return this.pizzasRepository.findPaginated(page, limit, search);
  }

  async findById(id: string): Promise<Pizza> {
    const pizza = await this.pizzasRepository.findById(id);
    if (!pizza) {
      throw new NotFoundException("Pizza not found");
    }
    return pizza;
  }

  async update(id: string, dto: UpdatePizzaDto): Promise<Pizza> {
    if (dto.name) {
      const existing = await this.pizzasRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException("Pizza with this name already exists");
      }
    }

    if (dto.ingredientIds?.length) {
      await this.ingredientsService.validateIds(dto.ingredientIds);
    }

    const { ingredientIds, ...updateData } = dto;
    const pizza = await this.pizzasRepository.update(id, updateData);
    if (!pizza) {
      throw new NotFoundException("Pizza not found");
    }

    if (ingredientIds) {
      await this.pizzaIngredientsRepository.deleteByPizzaId(id);
      if (ingredientIds.length > 0) {
        const pizzaIngredients = this.pizzaIngredientsRepository.createMany(id, ingredientIds);
        await this.pizzaIngredientsRepository.saveMany(pizzaIngredients);
      }
    }

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.pizzasRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException("Pizza not found");
    }
  }
}
