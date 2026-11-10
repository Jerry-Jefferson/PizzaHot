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
var AnalyticsMessagesController_1;
import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.js";
import { ack } from "../../libs/messaging/ack.js";
import { AnalyticsService } from "./analytics.service.js";
import { AnalyticsReadModelRepository } from "./analytics.repository.js";
let AnalyticsMessagesController = AnalyticsMessagesController_1 = class AnalyticsMessagesController {
    analytics;
    readModel;
    logger = new Logger(AnalyticsMessagesController_1.name);
    constructor(analytics, readModel) {
        this.analytics = analytics;
        this.readModel = readModel;
    }
    popularPizza(payload) {
        return this.analytics.getMostOrderedPizzaInMonth(payload.month, payload.year);
    }
    highestChecks() {
        return this.analytics.getUsersWithAboveAverageCheck();
    }
    async onOrderCreated(event, context) {
        await ack(context, this.logger, EVENTS.orderCreated, async () => {
            const createdAt = new Date(event.createdAt);
            await this.readModel.upsertOrderFact({
                orderId: event.orderId,
                userId: event.userId,
                userEmail: event.userEmail,
                userName: null,
                finalPrice: event.finalPrice,
                createdAt,
                status: "pending",
            });
            await this.readModel.upsertOrderItemFacts(event.items.map((item) => ({
                orderId: event.orderId,
                pizzaId: item.pizzaId,
                pizzaName: item.pizzaName,
                quantity: item.quantity,
                orderedAt: createdAt,
            })));
        });
    }
    async onOrderStatusChanged(event, context) {
        await ack(context, this.logger, EVENTS.orderStatusChanged, () => this.readModel.setOrderStatus(event.orderId, event.status));
    }
    async onUserRegistered(event, context) {
        await ack(context, this.logger, EVENTS.userRegistered, () => this.readModel.upsertUserFact({
            userId: event.userId,
            email: event.email,
            name: event.name,
            isDeleted: false,
        }));
    }
    async onUserDeleted(event, context) {
        await ack(context, this.logger, EVENTS.userDeleted, () => this.readModel.markUserDeleted(event.userId));
    }
};
__decorate([
    MessagePattern(RPC.analytics.popularPizza),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsMessagesController.prototype, "popularPizza", null);
__decorate([
    MessagePattern(RPC.analytics.highestChecks),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsMessagesController.prototype, "highestChecks", null);
__decorate([
    EventPattern(EVENTS.orderCreated),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], AnalyticsMessagesController.prototype, "onOrderCreated", null);
__decorate([
    EventPattern(EVENTS.orderStatusChanged),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], AnalyticsMessagesController.prototype, "onOrderStatusChanged", null);
__decorate([
    EventPattern(EVENTS.userRegistered),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], AnalyticsMessagesController.prototype, "onUserRegistered", null);
__decorate([
    EventPattern(EVENTS.userDeleted),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], AnalyticsMessagesController.prototype, "onUserDeleted", null);
AnalyticsMessagesController = AnalyticsMessagesController_1 = __decorate([
    Controller(),
    __metadata("design:paramtypes", [AnalyticsService,
        AnalyticsReadModelRepository])
], AnalyticsMessagesController);
export { AnalyticsMessagesController };
//# sourceMappingURL=analytics.controller.js.map