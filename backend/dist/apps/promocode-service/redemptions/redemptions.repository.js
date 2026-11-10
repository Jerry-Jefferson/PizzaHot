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
import { LessThan, Repository } from "typeorm";
import { PromocodeRedemption } from "./promocode-redemption.entity.js";
import { RedemptionStatus } from "./redemption-status.constant.js";
let RedemptionsRepository = class RedemptionsRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findActive(userId, promocodeId) {
        return this.repository.findOne({ where: { userId, promocodeId } });
    }
    async reserve(userId, promocodeId) {
        const result = await this.repository
            .createQueryBuilder()
            .insert()
            .into(PromocodeRedemption)
            .values({ userId, promocodeId, status: RedemptionStatus.PENDING })
            .orIgnore()
            .returning("*")
            .execute();
        const row = result.raw;
        return row.length > 0 ? row[0] : null;
    }
    async confirm(userId, promocodeId, orderId) {
        await this.repository.update({ userId, promocodeId }, { status: RedemptionStatus.CONFIRMED, orderId });
    }
    async release(userId, promocodeId) {
        await this.repository.delete({ userId, promocodeId, status: RedemptionStatus.PENDING });
    }
    async releaseStale(olderThan) {
        const result = await this.repository.delete({
            status: RedemptionStatus.PENDING,
            createdAt: LessThan(olderThan),
        });
        return result.affected ?? 0;
    }
    async countByStatus(status) {
        return this.repository.count({ where: { status } });
    }
};
RedemptionsRepository = __decorate([
    Injectable(),
    __param(0, InjectRepository(PromocodeRedemption)),
    __metadata("design:paramtypes", [Repository])
], RedemptionsRepository);
export { RedemptionsRepository };
//# sourceMappingURL=redemptions.repository.js.map