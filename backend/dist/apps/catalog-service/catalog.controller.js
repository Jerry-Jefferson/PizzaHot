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
var CatalogMessagesController_1;
import { Controller, Inject, Logger, NotFoundException } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.js";
import { EVENTS_CLIENT } from "../../libs/messaging/tokens.constant.js";
import { PIZZAS_REPOSITORY } from "../../libs/database/tokens.js";
import { ack } from "../../libs/messaging/ack.js";
import { PizzasService } from "./pizzas/pizzas.service.js";
import { IngredientsService } from "./ingredients/ingredients.service.js";
let CatalogMessagesController = CatalogMessagesController_1 = class CatalogMessagesController {
    pizzas;
    ingredients;
    pizzasRepository;
    events;
    logger = new Logger(CatalogMessagesController_1.name);
    constructor(pizzas, ingredients, pizzasRepository, events) {
        this.pizzas = pizzas;
        this.ingredients = ingredients;
        this.pizzasRepository = pizzasRepository;
        this.events = events;
    }
    list(payload) {
        return this.pizzas.findAll(payload.page, payload.limit, payload.search);
    }
    findById(payload) {
        return this.pizzas.getById(payload.id);
    }
    create(payload) {
        return this.pizzas.create(payload);
    }
    update(payload) {
        return this.pizzas.update(payload.id, payload.dto);
    }
    setImage(payload) {
        return this.pizzas.setImagePath(payload.id, payload.imagePath);
    }
    async remove(payload) {
        await this.pizzas.remove(payload.id);
        this.events.emit(EVENTS.pizzaDeleted, { pizzaId: payload.id });
        return { ok: true };
    }
    async resolve(payload) {
        const found = await this.pizzasRepository.findByIds(payload.pizzaIds);
        const byId = new Map(found.map((pizza) => [pizza.id, pizza]));
        return payload.pizzaIds.map((pizzaId) => {
            const pizza = byId.get(pizzaId);
            if (!pizza) {
                throw new NotFoundException(`Pizza ${pizzaId} is no longer available`);
            }
            return {
                pizzaId: pizza.id,
                name: pizza.name,
                price: Number(pizza.price),
                isAvailable: true,
            };
        });
    }
    listIngredients() {
        return this.ingredients.findAll();
    }
    findIngredient(payload) {
        return this.ingredients.findById(payload.id);
    }
    createIngredient(payload) {
        return this.ingredients.create(payload);
    }
    updateIngredient(payload) {
        return this.ingredients.update(payload.id, payload.dto);
    }
    async removeIngredient(payload) {
        await this.ingredients.remove(payload.id);
        return { ok: true };
    }
    async onOrderCreated(event, context) {
        await ack(context, this.logger, EVENTS.orderCreated, async () => {
            const pizzaIds = event.items
                .map((item) => item.pizzaId)
                .filter((pizzaId) => pizzaId !== null);
            await this.pizzasRepository.markOrdered(pizzaIds, new Date(event.createdAt));
        });
    }
};
__decorate([
    MessagePattern(RPC.catalog.pizzaList),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "list", null);
__decorate([
    MessagePattern(RPC.catalog.pizzaFindById),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "findById", null);
__decorate([
    MessagePattern(RPC.catalog.pizzaCreate),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "create", null);
__decorate([
    MessagePattern(RPC.catalog.pizzaUpdate),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "update", null);
__decorate([
    MessagePattern(RPC.catalog.pizzaSetImage),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "setImage", null);
__decorate([
    MessagePattern(RPC.catalog.pizzaRemove),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "remove", null);
__decorate([
    MessagePattern(RPC.catalog.pizzaResolve),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "resolve", null);
__decorate([
    MessagePattern(RPC.catalog.ingredientList),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "listIngredients", null);
__decorate([
    MessagePattern(RPC.catalog.ingredientFindById),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "findIngredient", null);
__decorate([
    MessagePattern(RPC.catalog.ingredientCreate),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "createIngredient", null);
__decorate([
    MessagePattern(RPC.catalog.ingredientUpdate),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "updateIngredient", null);
__decorate([
    MessagePattern(RPC.catalog.ingredientRemove),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "removeIngredient", null);
__decorate([
    EventPattern(EVENTS.orderCreated),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], CatalogMessagesController.prototype, "onOrderCreated", null);
CatalogMessagesController = CatalogMessagesController_1 = __decorate([
    Controller(),
    __param(2, Inject(PIZZAS_REPOSITORY)),
    __param(3, Inject(EVENTS_CLIENT)),
    __metadata("design:paramtypes", [PizzasService,
        IngredientsService, Object, Function])
], CatalogMessagesController);
export { CatalogMessagesController };
//# sourceMappingURL=catalog.controller.js.map