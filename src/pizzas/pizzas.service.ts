import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PizzasRepository } from "./pizzas.repository.ts";
import { Pizza } from "./entities/pizza.entity.ts";
import { PizzaDto } from "./dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "./dto/update-pizza.dto.ts";

@Injectable()
export class PizzasService {
  constructor(private readonly pizzasRepository: PizzasRepository) {}

  async create(dto: PizzaDto): Promise<Pizza> {
    const existing = await this.pizzasRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException("Pizza with this name already exists");
    }

    const pizza = this.pizzasRepository.create(dto);
    return this.pizzasRepository.save(pizza);
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

    const pizza = await this.pizzasRepository.update(id, dto);
    if (!pizza) {
      throw new NotFoundException("Pizza not found");
    }
    return pizza;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.pizzasRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException("Pizza not found");
    }
  }
}
