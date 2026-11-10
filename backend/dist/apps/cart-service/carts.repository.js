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
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./cart.entity.js";
let CartRepository = class CartRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        return this.repository.create(data);
    }
    async save(cart) {
        return this.repository.save(cart);
    }
    async findByUserId(userId) {
        return this.repository.findOne({
            where: { userId },
            relations: {
                cartItems: {
                    pizza: true,
                },
            },
        });
    }
    async findOrCreate(userId) {
        const existing = await this.findByUserId(userId);
        if (existing)
            return existing;
        const cart = this.create({ userId });
        const saved = await this.save(cart);
        saved.cartItems = [];
        return saved;
    }
    async remove(id) {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
    async clearPromocode(promocodeId) {
        const result = await this.repository.update({ promocodeId }, {
            promocodeId: null,
            promocodeCode: null,
            promocodeDiscount: null,
            promocodeDiscountMode: null,
            promocodeValidTill: null,
        });
        return result.affected ?? 0;
    }
};
CartRepository = __decorate([
    Injectable(),
    __param(0, InjectRepository(Cart)),
    __metadata("design:paramtypes", [Repository])
], CartRepository);
export { CartRepository };
//# sourceMappingURL=carts.repository.js.map