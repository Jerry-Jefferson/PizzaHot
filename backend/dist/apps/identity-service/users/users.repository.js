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
import { ILike, Repository } from "typeorm";
import { User } from "./user.entity.js";
let UsersRepository = class UsersRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        return this.repository.create(data);
    }
    async save(user) {
        return this.repository.save(user);
    }
    async findPaginated(page, limit, search) {
        const where = search
            ? [
                { name: ILike(`%${search.replace(/[%_]/g, "\\$&")}%`) },
                { surname: ILike(`%${search.replace(/[%_]/g, "\\$&")}%`) },
            ]
            : {};
        const [data, total] = await this.repository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" },
        });
        return { data, total };
    }
    async findById(id) {
        return this.repository.findOne({ where: { id } });
    }
    async findByEmail(email) {
        return this.repository.findOne({ where: { email } });
    }
    async findByVerificationToken(token) {
        return this.repository.findOne({ where: { verificationToken: token } });
    }
    async update(id, data) {
        const result = await this.repository.update(id, data);
        return (result.affected ?? 0) > 0;
    }
    async countByRole(role) {
        return this.repository.countBy({ role });
    }
    async remove(id) {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
};
UsersRepository = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository])
], UsersRepository);
export { UsersRepository };
//# sourceMappingURL=users.repository.js.map