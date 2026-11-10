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
import { Promocode } from "./promocode.entity.js";
let PromocodesRepository = class PromocodesRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        return this.repository.create(data);
    }
    async save(promocode) {
        return this.repository.save(promocode);
    }
    async findAll() {
        return this.repository.find({ withDeleted: true });
    }
    async findById(id) {
        return this.repository.findOneBy({ id });
    }
    async findByCode(code) {
        return this.repository.findOne({ where: { code } });
    }
    async update(id, data) {
        const result = await this.repository.update(id, data);
        return (result.affected ?? 0) > 0;
    }
    async remove(id) {
        const result = await this.repository.softDelete(id);
        return (result.affected ?? 0) > 0;
    }
    async restore(id) {
        const result = await this.repository.restore(id);
        return (result.affected ?? 0) > 0;
    }
};
PromocodesRepository = __decorate([
    Injectable(),
    __param(0, InjectRepository(Promocode)),
    __metadata("design:paramtypes", [Repository])
], PromocodesRepository);
export { PromocodesRepository };
//# sourceMappingURL=promocodes.repository.js.map