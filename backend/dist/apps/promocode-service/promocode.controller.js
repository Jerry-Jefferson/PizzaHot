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
var PromocodeMessagesController_1;
import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.js";
import { ack } from "../../libs/messaging/ack.js";
import { PromocodesService } from "./promocodes.service.js";
import { RedemptionsService } from "./redemptions/redemptions.service.js";
function toAvailablePromocode(promocode) {
    return {
        id: promocode.id,
        code: promocode.code,
        discount: Number(promocode.discount),
        discountMode: promocode.discountMode,
        validTill: promocode.validTill.toISOString(),
    };
}
let PromocodeMessagesController = PromocodeMessagesController_1 = class PromocodeMessagesController {
    promocodes;
    redemptions;
    logger = new Logger(PromocodeMessagesController_1.name);
    constructor(promocodes, redemptions) {
        this.promocodes = promocodes;
        this.redemptions = redemptions;
    }
    list() {
        return this.promocodes.findAll();
    }
    findById(payload) {
        return this.promocodes.getById(payload.id);
    }
    findByCode(payload) {
        return this.promocodes.findByCode(payload.code);
    }
    create(payload) {
        return this.promocodes.create(payload);
    }
    async update(payload) {
        return this.promocodes.update(payload.id, payload.dto);
    }
    async remove(payload) {
        await this.promocodes.remove(payload.id);
        return { ok: true };
    }
    restore(payload) {
        return this.promocodes.restore(payload.id);
    }
    async checkAvailable(payload) {
        const promocode = await this.promocodes.findByCodeOrFail(payload.code);
        this.promocodes.assertNotExpired(promocode);
        await this.redemptions.assertAvailableFor(payload.userId, promocode.id);
        return toAvailablePromocode(promocode);
    }
    async reserve(payload) {
        const promocode = await this.promocodes.findById(payload.promocodeId);
        this.promocodes.assertNotExpired(promocode);
        await this.redemptions.reserve(payload.userId, payload.promocodeId);
        return { promocode: toAvailablePromocode(promocode) };
    }
    async onOrderCreated(event, context) {
        await ack(context, this.logger, EVENTS.orderCreated, async () => {
            if (event.promocodeId) {
                await this.redemptions.confirm(event.userId, event.promocodeId, event.orderId);
            }
        });
    }
    async onOrderFailed(event, context) {
        await ack(context, this.logger, EVENTS.orderFailed, async () => {
            if (event.promocodeId) {
                await this.redemptions.release(event.userId, event.promocodeId);
                this.logger.warn(`Released promocode ${event.promocodeId} after failed order`);
            }
        });
    }
};
__decorate([
    MessagePattern(RPC.promocode.list),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "list", null);
__decorate([
    MessagePattern(RPC.promocode.findById),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "findById", null);
__decorate([
    MessagePattern(RPC.promocode.findByCode),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "findByCode", null);
__decorate([
    MessagePattern(RPC.promocode.create),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "create", null);
__decorate([
    MessagePattern(RPC.promocode.update),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "update", null);
__decorate([
    MessagePattern(RPC.promocode.remove),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "remove", null);
__decorate([
    MessagePattern(RPC.promocode.restore),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "restore", null);
__decorate([
    MessagePattern(RPC.promocode.checkAvailable),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "checkAvailable", null);
__decorate([
    MessagePattern(RPC.promocode.reserve),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "reserve", null);
__decorate([
    EventPattern(EVENTS.orderCreated),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "onOrderCreated", null);
__decorate([
    EventPattern(EVENTS.orderFailed),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], PromocodeMessagesController.prototype, "onOrderFailed", null);
PromocodeMessagesController = PromocodeMessagesController_1 = __decorate([
    Controller(),
    __metadata("design:paramtypes", [PromocodesService,
        RedemptionsService])
], PromocodeMessagesController);
export { PromocodeMessagesController };
//# sourceMappingURL=promocode.controller.js.map