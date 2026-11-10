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
import { Controller, Get, Post, Body, Put, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CatalogClient } from "../../clients/catalog.client.js";
import { CreateIngredientDto } from "../../../catalog-service/ingredients/dto/create-ingredient.dto.js";
import { UpdateIngredientDto } from "../../../catalog-service/ingredients/dto/update-ingredient.dto.js";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.js";
import { ingredientSchema, updateIngredientSchema, } from "../../../catalog-service/ingredients/ingredient.schema.js";
import { ApiCreateIngredient, ApiDeleteIngredient, ApiGetIngredient, ApiListIngredients, ApiUpdateIngredient, } from "./ingredients.api-docs.js";
import { Can } from "../../../../libs/auth/decorators/can.decorator.js";
import { Permission } from "../../../../libs/auth/permission.constant.js";
let IngredientsController = class IngredientsController {
    ingredientsService;
    constructor(ingredientsService) {
        this.ingredientsService = ingredientsService;
    }
    async create(dto) {
        return this.ingredientsService.createIngredient(dto);
    }
    async findAll() {
        return this.ingredientsService.findAllIngredients();
    }
    async findOne(id) {
        return this.ingredientsService.findIngredientById(id);
    }
    async update(id, dto) {
        return this.ingredientsService.updateIngredient(id, dto);
    }
    async remove(id) {
        await this.ingredientsService.removeIngredient(id);
    }
};
__decorate([
    Post(),
    Can(Permission.INGREDIENT_WRITE),
    ApiCreateIngredient(),
    __param(0, Body(new ZodValidationPipe(ingredientSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateIngredientDto]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "create", null);
__decorate([
    Get(),
    Can(Permission.INGREDIENT_READ),
    ApiListIngredients(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "findAll", null);
__decorate([
    Get(":id"),
    Can(Permission.INGREDIENT_READ),
    ApiGetIngredient(),
    __param(0, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "findOne", null);
__decorate([
    Put(":id"),
    Can(Permission.INGREDIENT_WRITE),
    ApiUpdateIngredient(),
    __param(0, Param("id", ParseUUIDPipe)),
    __param(1, Body(new ZodValidationPipe(updateIngredientSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateIngredientDto]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "update", null);
__decorate([
    Delete(":id"),
    HttpCode(HttpStatus.NO_CONTENT),
    Can(Permission.INGREDIENT_DELETE),
    ApiDeleteIngredient(),
    __param(0, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "remove", null);
IngredientsController = __decorate([
    ApiTags("Ingredients"),
    ApiBearerAuth(),
    Controller("ingredients"),
    __metadata("design:paramtypes", [CatalogClient])
], IngredientsController);
export { IngredientsController };
//# sourceMappingURL=ingredients.controller.js.map