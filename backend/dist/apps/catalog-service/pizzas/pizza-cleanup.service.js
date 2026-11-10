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
var PizzaCleanupService_1;
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PIZZAS_REPOSITORY } from "../../../libs/database/tokens.js";
const CLEANUP_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
let PizzaCleanupService = PizzaCleanupService_1 = class PizzaCleanupService {
    pizzasRepository;
    logger = new Logger(PizzaCleanupService_1.name);
    constructor(pizzasRepository) {
        this.pizzasRepository = pizzasRepository;
    }
    async handleCleanup() {
        this.logger.log("Pizza cleanup started");
        try {
            const cutoffDate = new Date(Date.now() - CLEANUP_WINDOW_MS);
            const deletedCount = await this.pizzasRepository.deleteNotOrderedSince(cutoffDate);
            this.logger.log(`Pizza cleanup finished. Deleted ${deletedCount} pizzas.`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error("Pizza cleanup failed", error instanceof Error ? error.stack : String(error));
            return 0;
        }
    }
};
__decorate([
    Cron("0 3 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PizzaCleanupService.prototype, "handleCleanup", null);
PizzaCleanupService = PizzaCleanupService_1 = __decorate([
    Injectable(),
    __param(0, Inject(PIZZAS_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PizzaCleanupService);
export { PizzaCleanupService };
//# sourceMappingURL=pizza-cleanup.service.js.map