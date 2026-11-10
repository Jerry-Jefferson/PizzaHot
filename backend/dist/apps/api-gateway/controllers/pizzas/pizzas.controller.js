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
import { Controller, Get, Param, Post, Body, ParseUUIDPipe, Delete, Query, Patch, Put, UseInterceptors, UploadedFile, HttpCode, HttpStatus, } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CatalogClient } from "../../clients/catalog.client.js";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.js";
import { ImageCategory, ImageValidationPipe, UPLOADS_URL_PREFIX, imageMulterOptions, } from "../../../../libs/upload/index.js";
import { CreatePizzaDto } from "../../../catalog-service/pizzas/dto/create-pizza.dto.js";
import { UpdatePizzaDto } from "../../../catalog-service/pizzas/dto/update-pizza.dto.js";
import { pizzaSchema, listPizzasQuerySchema, updatePizzaSchema, } from "../../../catalog-service/pizzas/pizza.schema.js";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiAddPizza, ApiFindAllPizza, ApiFindOnePizza, ApiRemovePizza, ApiUpdatePizza, ApiUploadImagePizza, } from "./pizzas.api-docs.js";
import { Can } from "../../../../libs/auth/decorators/can.decorator.js";
import { Permission } from "../../../../libs/auth/permission.constant.js";
let PizzasController = class PizzasController {
    pizzasService;
    constructor(pizzasService) {
        this.pizzasService = pizzasService;
    }
    async findAll(query) {
        return this.pizzasService.findAll(query.page, query.limit, query.search);
    }
    async findOne(id) {
        return this.pizzasService.findById(id);
    }
    async addPizza(dto) {
        return this.pizzasService.create(dto);
    }
    async update(id, dto) {
        return this.pizzasService.update(id, dto);
    }
    async uploadImage(id, image) {
        const imagePath = `${UPLOADS_URL_PREFIX}/${ImageCategory.PIZZAS}/${image.filename}`;
        return this.pizzasService.setImagePath(id, imagePath);
    }
    async remove(id) {
        await this.pizzasService.remove(id);
    }
};
__decorate([
    Get(),
    Can(Permission.PIZZA_READ),
    ApiFindAllPizza(),
    __param(0, Query(new ZodValidationPipe(listPizzasQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PizzasController.prototype, "findAll", null);
__decorate([
    Get(":id"),
    Can(Permission.PIZZA_READ),
    ApiFindOnePizza(),
    __param(0, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PizzasController.prototype, "findOne", null);
__decorate([
    Post(),
    Can(Permission.PIZZA_WRITE),
    ApiAddPizza(),
    __param(0, Body(new ZodValidationPipe(pizzaSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePizzaDto]),
    __metadata("design:returntype", Promise)
], PizzasController.prototype, "addPizza", null);
__decorate([
    Put(":id"),
    Can(Permission.PIZZA_WRITE),
    ApiUpdatePizza(),
    __param(0, Param("id", ParseUUIDPipe)),
    __param(1, Body(new ZodValidationPipe(updatePizzaSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdatePizzaDto]),
    __metadata("design:returntype", Promise)
], PizzasController.prototype, "update", null);
__decorate([
    Patch(":id/image"),
    Can(Permission.PIZZA_WRITE),
    UseInterceptors(FileInterceptor("image", imageMulterOptions(ImageCategory.PIZZAS))),
    ApiUploadImagePizza(),
    __param(0, Param("id", ParseUUIDPipe)),
    __param(1, UploadedFile(new ImageValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PizzasController.prototype, "uploadImage", null);
__decorate([
    Delete(":id"),
    HttpCode(HttpStatus.NO_CONTENT),
    Can(Permission.PIZZA_DELETE),
    ApiRemovePizza(),
    __param(0, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PizzasController.prototype, "remove", null);
PizzasController = __decorate([
    ApiTags("Pizzas"),
    ApiBearerAuth(),
    Controller("pizzas"),
    __metadata("design:paramtypes", [CatalogClient])
], PizzasController);
export { PizzasController };
//# sourceMappingURL=pizzas.controller.js.map