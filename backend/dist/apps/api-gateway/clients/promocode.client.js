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
import { PROMOCODE_CLIENT } from "../../../libs/messaging/tokens.constant.js";
import { RPC } from "../../../libs/contracts/index.js";
import { rpc } from "../../../libs/messaging/rpc.util.js";
let PromocodeClient = class PromocodeClient {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll() {
        return rpc(this.client, RPC.promocode.list, {});
    }
    findById(id) {
        return rpc(this.client, RPC.promocode.findById, { id });
    }
    create(dto) {
        return rpc(this.client, RPC.promocode.create, dto);
    }
    update(id, dto) {
        return rpc(this.client, RPC.promocode.update, { id, dto });
    }
    remove(id) {
        return rpc(this.client, RPC.promocode.remove, { id });
    }
    restore(id) {
        return rpc(this.client, RPC.promocode.restore, { id });
    }
};
PromocodeClient = __decorate([
    Injectable(),
    __param(0, Inject(PROMOCODE_CLIENT)),
    __metadata("design:paramtypes", [Function])
], PromocodeClient);
export { PromocodeClient };
//# sourceMappingURL=promocode.client.js.map