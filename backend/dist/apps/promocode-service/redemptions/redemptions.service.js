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
var RedemptionsService_1;
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { REDEMPTIONS_REPOSITORY } from "../../../libs/database/tokens.js";
const RESERVATION_TTL_MS = 15 * 60 * 1000;
let RedemptionsService = RedemptionsService_1 = class RedemptionsService {
    redemptions;
    logger = new Logger(RedemptionsService_1.name);
    constructor(redemptions) {
        this.redemptions = redemptions;
    }
    async isAvailableFor(userId, promocodeId) {
        const existing = await this.redemptions.findActive(userId, promocodeId);
        return existing === null;
    }
    async assertAvailableFor(userId, promocodeId) {
        if (!(await this.isAvailableFor(userId, promocodeId))) {
            throw new BadRequestException("You have already used this promocode in a previous order");
        }
    }
    async reserve(userId, promocodeId) {
        const reserved = await this.redemptions.reserve(userId, promocodeId);
        if (!reserved) {
            throw new BadRequestException("You have already used this promocode in a previous order");
        }
    }
    async confirm(userId, promocodeId, orderId) {
        await this.redemptions.confirm(userId, promocodeId, orderId);
    }
    async release(userId, promocodeId) {
        await this.redemptions.release(userId, promocodeId);
    }
    async reapStaleReservations() {
        try {
            const released = await this.redemptions.releaseStale(new Date(Date.now() - RESERVATION_TTL_MS));
            if (released > 0) {
                this.logger.warn(`Released ${released} stale promocode reservation(s)`);
            }
            return released;
        }
        catch (error) {
            this.logger.error("Stale reservation reaper failed", error instanceof Error ? error.stack : String(error));
            return 0;
        }
    }
};
__decorate([
    Cron("*/5 * * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RedemptionsService.prototype, "reapStaleReservations", null);
RedemptionsService = RedemptionsService_1 = __decorate([
    Injectable(),
    __param(0, Inject(REDEMPTIONS_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], RedemptionsService);
export { RedemptionsService };
//# sourceMappingURL=redemptions.service.js.map