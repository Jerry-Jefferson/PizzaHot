import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { PizzasRepository } from "./pizzas.repository.ts";
import { Pizza } from "./entities/pizza.entity.ts";
import { PizzaIngredient } from "./entities/pizza-ingredient.entity.ts";
import { IngredientsService } from "../ingredients/ingredients.service.ts";
import { CreatePizzaDto } from "./dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "./dto/update-pizza.dto.ts";
import { unlink } from "fs/promises";
import { join } from "path";
import { UPLOADS_URL_PREFIX } from "../shared/constants/upload.constants.ts";

@Injectable()
export class PizzasService {
  private readonly logger = new Logger(PizzasService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly pizzasRepository: PizzasRepository,
    private readonly ingredientsService: IngredientsService
  ) {}

  private buildImagePath(file: Express.Multer.File): string {
    return `${UPLOADS_URL_PREFIX}/pizzas/${file.filename}`;
  }

  async create(dto: CreatePizzaDto): Promise<Pizza> {
    const existing = await this.pizzasRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException("Pizza with this name already exists");
    }

    if (dto.ingredientIds?.length) {
      await this.ingredientsService.validateIds(dto.ingredientIds);
    }

    const { ingredientIds, ...createData } = dto;

    const savedPizza = await this.dataSource.transaction(async (manager) => {
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
    await this.findById(id);

    if (dto.name) {
      const nameConflict = await this.pizzasRepository.findByName(dto.name);
      if (nameConflict && nameConflict.id !== id) {
        throw new ConflictException("Pizza with this name already exists");
      }
    }

    if (dto.ingredientIds?.length) {
      await this.ingredientsService.validateIds(dto.ingredientIds);
    }

    const { ingredientIds, ...updateData } = dto;

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Pizza, id, updateData);

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

    return this.findById(id);
  }

  async uploadImage(id: string, imageFile: Express.Multer.File): Promise<Pizza> {
    const existingPizza = await this.pizzasRepository.findById(id);
    if (!existingPizza) {
      await this.deleteFileQuietly(imageFile.path);
      throw new NotFoundException("Pizza not found");
    }

    if (existingPizza.image) {
      await this.deleteImageByPath(existingPizza.image);
    }

    const imagePath = this.buildImagePath(imageFile);
    await this.pizzasRepository.update(id, { image: imagePath });

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const pizza = await this.pizzasRepository.findById(id);
    if (!pizza) {
      throw new NotFoundException("Pizza not found");
    }

    if (pizza.image) {
      await this.deleteImageByPath(pizza.image);
    }

    const deleted = await this.pizzasRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException("Pizza not found");
    }
  }

  private async deleteImageByPath(imagePath: string): Promise<void> {
    const relativeFsPath = imagePath.replace(`${UPLOADS_URL_PREFIX}/`, "");
    const absolutePath = join(process.cwd(), "uploads", relativeFsPath);
    await this.deleteFileQuietly(absolutePath);
  }

  private async deleteFileQuietly(absolutePath: string): Promise<void> {
    try {
      await unlink(absolutePath);
    } catch (error) {
      this.logger.warn(`Failed to delete file at ${absolutePath}: ${String(error)}`);
    }
  }
}
