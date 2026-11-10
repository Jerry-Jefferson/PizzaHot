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
var OrderMessagesController_1;
import { Controller, Inject, Logger } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.js";
import { EVENTS_CLIENT } from "../../libs/messaging/tokens.constant.js";
import { ack } from "../../libs/messaging/ack.js";
import { OrdersService } from "./orders.service.js";
import { ORDERS_REPOSITORY } from "../../libs/database/tokens.js";
let OrderMessagesController = OrderMessagesController_1 = class OrderMessagesController {
    orders;
    ordersRepository;
    events;
    logger = new Logger(OrderMessagesController_1.name);
    constructor(orders, ordersRepository, events) {
        this.orders = orders;
        this.ordersRepository = ordersRepository;
        this.events = events;
    }
    create(payload) {
        return this.orders.create(payload.userId, payload.dto);
    }
    findMine(payload) {
        return this.orders.findByUserId(payload.userId, payload.page ?? 1, payload.limit ?? 10);
    }
    findMineById(payload) {
        return this.orders.findMyOrderById(payload.orderId, payload.userId);
    }
    findById(payload) {
        return this.orders.findById(payload.orderId);
    }
    findAll(payload) {
        return this.orders.findAll({
            ...payload,
            page: payload.page ?? 1,
            limit: payload.limit ?? 10,
        });
    }
    findByUserId(payload) {
        return this.orders.findByUserId(payload.userId, payload.page ?? 1, payload.limit ?? 10);
    }
    async updateStatus(payload) {
        const before = await this.orders.findById(payload.orderId);
        const updated = await this.orders.updateStatus(payload.orderId, payload.status);
        const event = {
            orderId: payload.orderId,
            userId: before.userId ?? "",
            previousStatus: before.status,
            status: payload.status,
        };
        this.events.emit(EVENTS.orderStatusChanged, event);
        return updated;
    }
    async onUserDeleted(event, context) {
        await ack(context, this.logger, EVENTS.userDeleted, async () => {
            const detached = await this.ordersRepository.detachUser(event.userId);
            this.logger.log(`Detached ${detached} order(s) from deleted user ${event.userId}`);
        });
    }
};
__decorate([
    MessagePattern(RPC.order.create),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessagesController.prototype, "create", null);
__decorate([
    MessagePattern(RPC.order.findMine),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessagesController.prototype, "findMine", null);
__decorate([
    MessagePattern(RPC.order.findMineById),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessagesController.prototype, "findMineById", null);
__decorate([
    MessagePattern(RPC.order.findById),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessagesController.prototype, "findById", null);
__decorate([
    MessagePattern(RPC.order.findAll),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessagesController.prototype, "findAll", null);
__decorate([
    MessagePattern(RPC.order.findByUserId),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessagesController.prototype, "findByUserId", null);
__decorate([
    MessagePattern(RPC.order.updateStatus),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessagesController.prototype, "updateStatus", null);
__decorate([
    EventPattern(EVENTS.userDeleted),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], OrderMessagesController.prototype, "onUserDeleted", null);
OrderMessagesController = OrderMessagesController_1 = __decorate([
    Controller(),
    __param(1, Inject(ORDERS_REPOSITORY)),
    __param(2, Inject(EVENTS_CLIENT)),
    __metadata("design:paramtypes", [OrdersService, Object, Function])
], OrderMessagesController);
export { OrderMessagesController };
//# sourceMappingURL=order.controller.js.map