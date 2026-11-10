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
import { In, Repository } from "typeorm";
import { Ingredient } from "./ingredient.entity.js";
let IngredientsRepository = class IngredientsRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        return this.repository.create(data);
    }
    async save(ingredient) {
        return this.repository.save(ingredient);
    }
    async findAll() {
        return this.repository.find();
    }
    async findById(id) {
        return this.repository.findOneBy({ id });
    }
    async findByName(name) {
        return this.repository.findOne({ where: { name } });
    }
    async findByIds(ids) {
        if (ids.length === 0)
            return [];
        return this.repository.find({ where: { id: In(ids) } });
    }
    async update(id, data) {
        const result = await this.repository.update(id, data);
        if ((result.affected ?? 0) === 0) {
            return null;
        }
        return this.findById(id);
    }
    async remove(id) {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
};
IngredientsRepository = __decorate([
    Injectable(),
    __param(0, InjectRepository(Ingredient)),
    __metadata("design:paramtypes", [Repository])
], IngredientsRepository);
export { IngredientsRepository };
//# sourceMappingURL=ingredients.repository.js.map