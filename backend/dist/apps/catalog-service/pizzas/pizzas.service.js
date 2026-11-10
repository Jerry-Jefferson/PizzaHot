var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PizzasService_1;
import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, } from "@nestjs/common";
import { PIZZAS_REPOSITORY } from "../../../libs/database/tokens.js";
import { IngredientsService } from "../ingredients/ingredients.service.js";
import { EVENTS } from "../../../libs/contracts/index.js";
import { EVENTS_CLIENT } from "../../../libs/messaging/tokens.constant.js";
import { IMAGE_STORAGE } from "../../../libs/upload/index.js";
import { PizzaResponseDto } from "./dto/pizza-response.dto.js";
let PizzasService = PizzasService_1 = class PizzasService {
    pizzasRepository;
    ingredientsService;
    events;
    images;
    logger = new Logger(PizzasService_1.name);
    constructor(pizzasRepository, ingredientsService, events, images) {
        this.pizzasRepository = pizzasRepository;
        this.ingredientsService = ingredientsService;
        this.events = events;
        this.images = images;
    }
    async create(dto) {
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
        this.publishUpsert(EVENTS.pizzaCreated, created);
        return PizzaResponseDto.fromEntity(created);
    }
    async findAll(page, limit, search) {
        const { data, total } = await this.pizzasRepository.findPaginated(page, limit, search);
        return { data: PizzaResponseDto.fromEntities(data), total };
    }
    async findById(id) {
        const pizza = await this.pizzasRepository.findById(id);
        if (!pizza) {
            throw new NotFoundException("Pizza not found");
        }
        return pizza;
    }
    async update(id, dto) {
        await this.findById(id);
        const nameConflict = await this.pizzasRepository.findByName(dto.name);
        if (nameConflict && nameConflict.id !== id) {
            throw new ConflictException("Pizza with this name already exists");
        }
        if (dto.ingredientIds.length > 0) {
            await this.ingredientsService.validateIds(dto.ingredientIds);
        }
        const { ingredientIds, ...updateData } = dto;
        await this.pizzasRepository.updateWithIngredients(id, updateData, ingredientIds);
        const updated = await this.findById(id);
        this.logger.log(`Pizza updated: "${updated.name}" (id: ${id})`);
        this.publishUpsert(EVENTS.pizzaUpdated, updated);
        return PizzaResponseDto.fromEntity(updated);
    }
    async setImagePath(id, imagePath) {
        const existingPizza = await this.pizzasRepository.findById(id);
        if (!existingPizza) {
            await this.images.remove(imagePath);
            throw new NotFoundException("Pizza not found");
        }
        if (existingPizza.image !== imagePath) {
            const oldImageWasThere = await this.images.remove(existingPizza.image);
            if (existingPizza.image && !oldImageWasThere) {
                this.notifyMissingImage(existingPizza, "replaced");
            }
        }
        await this.pizzasRepository.update(id, { image: imagePath });
        const updated = await this.findById(id);
        this.publishUpsert(EVENTS.pizzaUpdated, updated);
        return PizzaResponseDto.fromEntity(updated);
    }
    async remove(id) {
        const pizza = await this.pizzasRepository.findById(id);
        if (!pizza) {
            throw new NotFoundException("Pizza not found");
        }
        let imageWasThere = false;
        if (pizza.image) {
            try {
                imageWasThere = await this.images.remove(pizza.image);
            }
            catch (imageError) {
                this.logger.error(`Failed to delete image for pizza ${id}: ${String(imageError)}`);
                this.notifyImageDeletionFailure(pizza);
                throw new InternalServerErrorException("Pizza deletion failed, please try again later");
            }
        }
        let deleted;
        try {
            deleted = await this.pizzasRepository.remove(id);
        }
        catch (error) {
            this.logger.error(`Failed to delete pizza ${id}: ${String(error)}`);
            throw new InternalServerErrorException("Pizza deletion failed, please try again later");
        }
        if (!deleted) {
            throw new NotFoundException("Pizza not found");
        }
        this.logger.log(`Pizza deleted: "${pizza.name}" (id: ${id})`);
        if (pizza.image && !imageWasThere) {
            this.notifyMissingImage(pizza, "deleted");
        }
    }
    notifyMissingImage(pizza, action) {
        const event = {
            message: `Image file of pizza "${pizza.name}" (${pizza.id}) was already missing when the image was ${action}. The database pointed at ${pizza.image}. An unreferenced file may be left in uploads.`,
            errorType: "PizzaImageMissing",
            path: pizza.image ?? undefined,
            timestamp: new Date().toISOString(),
        };
        try {
            this.events.emit(EVENTS.criticalError, event);
        }
        catch (error) {
            this.logger.error(`Failed to publish missing image alert: ${String(error)}`);
        }
    }
    notifyImageDeletionFailure(pizza) {
        const event = {
            message: `Pizza deletion aborted: failed to delete image file for pizza "${pizza.name}" (${pizza.id}). The pizza was not deleted.`,
            errorType: "PizzaImageDeletionError",
            path: pizza.image ?? undefined,
            timestamp: new Date().toISOString(),
        };
        try {
            this.events.emit(EVENTS.criticalError, event);
        }
        catch (error) {
            this.logger.error(`Failed to publish image deletion alert: ${String(error)}`);
        }
    }
    publishUpsert(pattern, pizza) {
        const event = {
            pizzaId: pizza.id,
            name: pizza.name,
            price: Number(pizza.price),
            image: pizza.image,
            isAvailable: true,
        };
        this.events.emit(pattern, event);
    }
    async getById(id) {
        return PizzaResponseDto.fromEntity(await this.findById(id));
    }
};
PizzasService = PizzasService_1 = __decorate([
    Injectable(),
    __param(0, Inject(PIZZAS_REPOSITORY)),
    __param(2, Inject(EVENTS_CLIENT)),
    __param(3, Inject(IMAGE_STORAGE)),
    __metadata("design:paramtypes", [Object, IngredientsService, Function, Object])
], PizzasService);
export { PizzasService };
//# sourceMappingURL=pizzas.service.js.map