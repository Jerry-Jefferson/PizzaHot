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
import { IDENTITY_CLIENT } from "../../../libs/messaging/tokens.constant.js";
import { RPC } from "../../../libs/contracts/index.js";
import { rpc } from "../../../libs/messaging/rpc.util.js";
let IdentityClient = class IdentityClient {
    client;
    constructor(client) {
        this.client = client;
    }
    register(dto) {
        return rpc(this.client, RPC.identity.register, dto);
    }
    login(dto) {
        return rpc(this.client, RPC.identity.login, dto);
    }
    verifyEmailAccept(token) {
        return rpc(this.client, RPC.identity.verifyEmail, { token });
    }
    verifyEmailDecline(token) {
        return rpc(this.client, RPC.identity.declineEmail, { token });
    }
    getProfile(userId) {
        return rpc(this.client, RPC.identity.findById, { id: userId });
    }
    findById(id) {
        return rpc(this.client, RPC.identity.findById, { id });
    }
    findAll(page, limit, search) {
        return rpc(this.client, RPC.identity.findAll, { page, limit, search });
    }
    update(userId, dto) {
        return rpc(this.client, RPC.identity.updateMe, { userId, dto });
    }
    setImage(userId, imagePath) {
        return rpc(this.client, RPC.identity.setImage, { userId, imagePath });
    }
    setRole(id, role, actingUserId) {
        return rpc(this.client, RPC.identity.setRole, { id, role, actingUserId });
    }
    changePassword(userId, dto) {
        return rpc(this.client, RPC.identity.changePassword, { userId, dto });
    }
    remove(userId) {
        return rpc(this.client, RPC.identity.deleteMe, { userId });
    }
};
IdentityClient = __decorate([
    Injectable(),
    __param(0, Inject(IDENTITY_CLIENT)),
    __metadata("design:paramtypes", [Function])
], IdentityClient);
export { IdentityClient };
//# sourceMappingURL=identity.client.js.map