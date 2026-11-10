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
import { Inject, Injectable } from "@nestjs/common";
import { CART_CLIENT } from "../../../libs/messaging/tokens.constant.js";
import { RPC } from "../../../libs/contracts/index.js";
import { rpc } from "../../../libs/messaging/rpc.util.js";
let CartClient = class CartClient {
    client;
    constructor(client) {
        this.client = client;
    }
    getCart(userId) {
        return rpc(this.client, RPC.cart.get, { userId });
    }
    addItem(userId, pizzaId, quantity) {
        return rpc(this.client, RPC.cart.addItem, { userId, pizzaId, quantity });
    }
    updateItemQuantity(userId, pizzaId, quantity) {
        return rpc(this.client, RPC.cart.updateItemQuantity, { userId, pizzaId, quantity });
    }
    removeItem(userId, pizzaId) {
        return rpc(this.client, RPC.cart.removeItem, { userId, pizzaId });
    }
    clearCart(userId) {
        return rpc(this.client, RPC.cart.clear, { userId });
    }
    applyPromocode(userId, code) {
        return rpc(this.client, RPC.cart.applyPromocode, { userId, code });
    }
    removePromocode(userId) {
        return rpc(this.client, RPC.cart.removePromocode, { userId });
    }
};
CartClient = __decorate([
    Injectable(),
    __param(0, Inject(CART_CLIENT)),
    __metadata("design:paramtypes", [Function])
], CartClient);
export { CartClient };
//# sourceMappingURL=cart.client.js.map