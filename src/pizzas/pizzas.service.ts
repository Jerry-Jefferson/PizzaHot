import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PIZZAS_REPOSITORY } from "../shared/database/tokens.ts";
import type { IPizzasRepository } from "./interfaces/pizzas.repository.interface.ts";
import { Pizza } from "./entities/pizza.entity.ts";
import { IngredientsService } from "../ingredients/ingredients.service.ts";
import { NotificationsService } from "../notifications/notifications.service.ts";
import { NotificationType } from "../notifications/constants/notification-type.constant.ts";
import { CreatePizzaDto } from "./dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "./dto/update-pizza.dto.ts";
import { unlink } from "fs/promises";
import { join } from "path";
import { UPLOADS_URL_PREFIX } from "../shared/constants/upload.constants.ts";

@Injectable()
export class PizzasService {
  private readonly logger = new Logger(PizzasService.name);
  private readonly adminEmail: string;

  constructor(
    @Inject(PIZZAS_REPOSITORY)
    private readonly pizzasRepository: IPizzasRepository,
    private readonly ingredientsService: IngredientsService,
    private readonly notificationsService: NotificationsService,
    configService: ConfigService
  ) {
    this.adminEmail = configService.get<string>("CRITICAL_ERROR_EMAIL") ?? "admin@pizzahot.local";
  }

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

    const savedPizza = await this.pizzasRepository.createWithIngredients(createData, ingredientIds);

    const created = await this.findById(savedPizza.id);
    this.logger.log(`Pizza created: "${created.name}" (id: ${created.id})`);
    return created;
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

    await this.pizzasRepository.updateWithIngredients(id, updateData, ingredientIds);

    const updated = await this.findById(id);
    this.logger.log(`Pizza updated: "${updated.name}" (id: ${id})`);
    return updated;
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

    // The image is removed first: if the unlink fails, nothing has been written to
    // the database yet, so the pizza stays as it is instead of being deleted with
    // its file left behind on disk.
    if (pizza.image) {
      try {
        await this.deleteImageFile(pizza.image);
      } catch (imageError) {
        this.logger.error(`Failed to delete image for pizza ${id}: ${String(imageError)}`);
        await this.notifyImageDeletionFailure(pizza);
        throw new InternalServerErrorException("Pizza deletion failed, please try again later");
      }
    }

    let deleted: boolean;
    try {
      deleted = await this.pizzasRepository.remove(id);
    } catch (error) {
      this.logger.error(`Failed to delete pizza ${id}: ${String(error)}`);
      throw new InternalServerErrorException("Pizza deletion failed, please try again later");
    }

    if (!deleted) {
      throw new NotFoundException("Pizza not found");
    }

    this.logger.log(`Pizza deleted: "${pizza.name}" (id: ${id})`);
  }

  private async notifyImageDeletionFailure(pizza: Pizza): Promise<void> {
    await this.notificationsService
      .send({
        type: NotificationType.CRITICAL_ERROR,
        recipient: this.adminEmail,
        data: {
          message: `Pizza deletion aborted: failed to delete image file for pizza "${pizza.name}" (${pizza.id}). The pizza was not deleted.`,
          errorType: "PizzaImageDeletionError",
          path: pizza.image,
          timestamp: new Date().toISOString(),
        },
      })
      .catch((notifError) => {
        this.logger.error(
          `Failed to send image deletion error notification: ${String(notifError)}`
        );
      });
  }

  private async deleteImageFile(imagePath: string): Promise<void> {
    const relativeFsPath = imagePath.replace(`${UPLOADS_URL_PREFIX}/`, "");
    const absolutePath = join(process.cwd(), "uploads", relativeFsPath);
    await unlink(absolutePath);
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
