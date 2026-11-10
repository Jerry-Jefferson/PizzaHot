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
import { Inject, Injectable } from "@nestjs/common";
import { CATALOG_CLIENT } from "../../../libs/messaging/tokens.constant.js";
import { RPC } from "../../../libs/contracts/index.js";
import { rpc } from "../../../libs/messaging/rpc.util.js";
import { PaginatedResponseDto } from "../../../libs/pagination/paginated-response.dto.js";
let CatalogClient = class CatalogClient {
    client;
    constructor(client) {
        this.client = client;
    }
    async findAll(page, limit, search) {
        const { data, total } = await rpc(this.client, RPC.catalog.pizzaList, { page, limit, search });
        return new PaginatedResponseDto(data, page, limit, total);
    }
    findById(id) {
        return rpc(this.client, RPC.catalog.pizzaFindById, { id });
    }
    create(dto) {
        return rpc(this.client, RPC.catalog.pizzaCreate, dto);
    }
    update(id, dto) {
        return rpc(this.client, RPC.catalog.pizzaUpdate, { id, dto });
    }
    setImagePath(id, imagePath) {
        return rpc(this.client, RPC.catalog.pizzaSetImage, { id, imagePath });
    }
    remove(id) {
        return rpc(this.client, RPC.catalog.pizzaRemove, { id });
    }
    findAllIngredients() {
        return rpc(this.client, RPC.catalog.ingredientList, {});
    }
    findIngredientById(id) {
        return rpc(this.client, RPC.catalog.ingredientFindById, { id });
    }
    createIngredient(dto) {
        return rpc(this.client, RPC.catalog.ingredientCreate, dto);
    }
    updateIngredient(id, dto) {
        return rpc(this.client, RPC.catalog.ingredientUpdate, { id, dto });
    }
    removeIngredient(id) {
        return rpc(this.client, RPC.catalog.ingredientRemove, { id });
    }
};
CatalogClient = __decorate([
    Injectable(),
    __param(0, Inject(CATALOG_CLIENT)),
    __metadata("design:paramtypes", [Function])
], CatalogClient);
export { CatalogClient };
//# sourceMappingURL=catalog.client.js.map