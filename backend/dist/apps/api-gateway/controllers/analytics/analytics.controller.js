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
import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiGetMostOrderedPizza, ApiGetUsersAboveAverageCheck } from "./analytics.api-docs.js";
import { ApiOwnerOnly } from "../../../../libs/swagger/api-responses.decorator.js";
import { AnalyticsClient } from "../../clients/analytics.client.js";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.js";
import { mostOrderedPizzaQuerySchema } from "../../../analytics-service/analytics.schema.js";
import { Can } from "../../../../libs/auth/decorators/can.decorator.js";
import { Permission } from "../../../../libs/auth/permission.constant.js";
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getMostOrderedPizza(query) {
        return this.analyticsService.getMostOrderedPizzaInMonth(query.month, query.year);
    }
    async getUsersAboveAverageCheck() {
        return this.analyticsService.getUsersWithAboveAverageCheck();
    }
};
__decorate([
    Get("popular-pizza"),
    Can(Permission.ANALYTICS_READ),
    ApiGetMostOrderedPizza(),
    __param(0, Query(new ZodValidationPipe(mostOrderedPizzaQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMostOrderedPizza", null);
__decorate([
    Get("highest-checks"),
    Can(Permission.ANALYTICS_READ),
    ApiGetUsersAboveAverageCheck(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUsersAboveAverageCheck", null);
AnalyticsController = __decorate([
    ApiTags("Analytics"),
    ApiBearerAuth(),
    ApiOwnerOnly(),
    Controller("analytics"),
    __metadata("design:paramtypes", [AnalyticsClient])
], AnalyticsController);
export { AnalyticsController };
//# sourceMappingURL=analytics.controller.js.map