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
import { ORDER_CLIENT } from "../../../libs/messaging/tokens.constant.js";
import { RPC } from "../../../libs/contracts/index.js";
import { rpc } from "../../../libs/messaging/rpc.util.js";
import { PaginatedResponseDto } from "../../../libs/pagination/paginated-response.dto.js";
let OrderClient = class OrderClient {
    client;
    constructor(client) {
        this.client = client;
    }
    create(userId, dto) {
        return rpc(this.client, RPC.order.create, { userId, dto });
    }
    findByUserId(userId, page = 1, limit = 10) {
        return rpc(this.client, RPC.order.findMine, { userId, page, limit });
    }
    findMyOrderById(orderId, userId) {
        return rpc(this.client, RPC.order.findMineById, { orderId, userId });
    }
    findById(orderId) {
        return rpc(this.client, RPC.order.findById, { orderId });
    }
    async findAll(query) {
        const { data, total } = await rpc(this.client, RPC.order.findAll, query);
        return new PaginatedResponseDto(data, query.page, query.limit, total);
    }
    updateStatus(orderId, status) {
        return rpc(this.client, RPC.order.updateStatus, { orderId, status });
    }
};
OrderClient = __decorate([
    Injectable(),
    __param(0, Inject(ORDER_CLIENT)),
    __metadata("design:paramtypes", [Function])
], OrderClient);
export { OrderClient };
//# sourceMappingURL=order.client.js.map