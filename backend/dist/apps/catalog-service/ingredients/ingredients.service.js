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
var IngredientsService_1;
import { ConflictException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { INGREDIENTS_REPOSITORY } from "../../../libs/database/tokens.js";
import { IngredientResponseDto } from "./dto/ingredient-response.dto.js";
let IngredientsService = IngredientsService_1 = class IngredientsService {
    ingredientsRepository;
    logger = new Logger(IngredientsService_1.name);
    constructor(ingredientsRepository) {
        this.ingredientsRepository = ingredientsRepository;
    }
    async create(dto) {
        const existing = await this.ingredientsRepository.findByName(dto.name);
        if (existing) {
            throw new ConflictException("Ingredient with this name already exists");
        }
        const ingredient = this.ingredientsRepository.create(dto);
        const saved = await this.ingredientsRepository.save(ingredient);
        this.logger.log(`Ingredient created: "${saved.name}" (id: ${saved.id})`);
        return IngredientResponseDto.fromEntity(saved);
    }
    async findAll() {
        return IngredientResponseDto.fromEntities(await this.ingredientsRepository.findAll());
    }
    async findById(id) {
        const ingredient = await this.ingredientsRepository.findById(id);
        if (!ingredient) {
            throw new NotFoundException("Ingredient not found");
        }
        return IngredientResponseDto.fromEntity(ingredient);
    }
    async validateIds(ids) {
        if (ids.length === 0)
            return;
        const found = await this.ingredientsRepository.findByIds(ids);
        if (found.length !== ids.length) {
            const foundIds = new Set(found.map((i) => i.id));
            const missing = ids.filter((id) => !foundIds.has(id));
            throw new NotFoundException(`Ingredients not found: ${missing.join(", ")}`);
        }
    }
    async update(id, dto) {
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
    async remove(id) {
        const ingredient = await this.findById(id);
        const deleted = await this.ingredientsRepository.remove(id);
        if (!deleted) {
            throw new NotFoundException("Ingredient not found");
        }
        this.logger.log(`Ingredient deleted: "${ingredient.name}" (id: ${id})`);
    }
};
IngredientsService = IngredientsService_1 = __decorate([
    Injectable(),
    __param(0, Inject(INGREDIENTS_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], IngredientsService);
export { IngredientsService };
//# sourceMappingURL=ingredients.service.js.map