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
var CartMessagesController_1;
import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.js";
import { ack } from "../../libs/messaging/ack.js";
import { CartService } from "./carts.service.js";
import { PizzaSnapshotRepository } from "./snapshots/pizza-snapshot.repository.js";
let CartMessagesController = CartMessagesController_1 = class CartMessagesController {
    cart;
    snapshots;
    logger = new Logger(CartMessagesController_1.name);
    constructor(cart, snapshots) {
        this.cart = cart;
        this.snapshots = snapshots;
    }
    get(payload) {
        return this.cart.getCart(payload.userId);
    }
    addItem(payload) {
        return this.cart.addItem(payload.userId, payload.pizzaId, payload.quantity);
    }
    updateItemQuantity(payload) {
        return this.cart.updateItemQuantity(payload.userId, payload.pizzaId, payload.quantity);
    }
    async removeItem(payload) {
        await this.cart.removeItem(payload.userId, payload.pizzaId);
        return { ok: true };
    }
    async clear(payload) {
        await this.cart.clearCart(payload.userId);
        return { ok: true };
    }
    applyPromocode(payload) {
        return this.cart.applyPromocode(payload.userId, payload.code);
    }
    removePromocode(payload) {
        return this.cart.removePromocode(payload.userId);
    }
    async checkoutSnapshot(payload) {
        const cart = await this.cart.getCartEntity(payload.userId);
        if (!cart) {
            return { cartId: "", promocodeId: null, items: [] };
        }
        return {
            cartId: cart.id,
            promocodeId: cart.promocodeId,
            items: (cart.cartItems ?? []).map((item) => ({
                pizzaId: item.pizza.id,
                quantity: item.quantity,
            })),
        };
    }
    async onPizzaCreated(event, context) {
        await ack(context, this.logger, EVENTS.pizzaCreated, () => this.upsertSnapshot(event));
    }
    async onPizzaUpdated(event, context) {
        await ack(context, this.logger, EVENTS.pizzaUpdated, () => this.upsertSnapshot(event));
    }
    async onPizzaDeleted(event, context) {
        await ack(context, this.logger, EVENTS.pizzaDeleted, async () => {
            await this.snapshots.remove(event.pizzaId);
        });
    }
    async onUserDeleted(event, context) {
        await ack(context, this.logger, EVENTS.userDeleted, () => this.cart.deleteForUser(event.userId));
    }
    async onPromocodeDeleted(event, context) {
        await ack(context, this.logger, EVENTS.promocodeDeleted, () => this.cart.detachPromocodeEverywhere(event.promocodeId));
    }
    async onOrderCreated(event, context) {
        await ack(context, this.logger, EVENTS.orderCreated, () => this.cart.clearForOrder(event.userId));
    }
    async upsertSnapshot(event) {
        await this.snapshots.upsert({
            id: event.pizzaId,
            name: event.name,
            price: event.price,
            image: event.image,
            isAvailable: event.isAvailable,
        });
    }
};
__decorate([
    MessagePattern(RPC.cart.get),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "get", null);
__decorate([
    MessagePattern(RPC.cart.addItem),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "addItem", null);
__decorate([
    MessagePattern(RPC.cart.updateItemQuantity),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "updateItemQuantity", null);
__decorate([
    MessagePattern(RPC.cart.removeItem),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "removeItem", null);
__decorate([
    MessagePattern(RPC.cart.clear),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "clear", null);
__decorate([
    MessagePattern(RPC.cart.applyPromocode),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "applyPromocode", null);
__decorate([
    MessagePattern(RPC.cart.removePromocode),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "removePromocode", null);
__decorate([
    MessagePattern(RPC.cart.checkoutSnapshot),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "checkoutSnapshot", null);
__decorate([
    EventPattern(EVENTS.pizzaCreated),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "onPizzaCreated", null);
__decorate([
    EventPattern(EVENTS.pizzaUpdated),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "onPizzaUpdated", null);
__decorate([
    EventPattern(EVENTS.pizzaDeleted),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "onPizzaDeleted", null);
__decorate([
    EventPattern(EVENTS.userDeleted),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "onUserDeleted", null);
__decorate([
    EventPattern(EVENTS.promocodeDeleted),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "onPromocodeDeleted", null);
__decorate([
    EventPattern(EVENTS.orderCreated),
    __param(0, Payload()),
    __param(1, Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RmqContext]),
    __metadata("design:returntype", Promise)
], CartMessagesController.prototype, "onOrderCreated", null);
CartMessagesController = CartMessagesController_1 = __decorate([
    Controller(),
    __metadata("design:paramtypes", [CartService,
        PizzaSnapshotRepository])
], CartMessagesController);
export { CartMessagesController };
//# sourceMappingURL=cart.controller.js.map