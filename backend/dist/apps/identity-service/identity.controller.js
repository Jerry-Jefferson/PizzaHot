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
import { Controller, Inject } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.js";
import { EVENTS_CLIENT } from "../../libs/messaging/tokens.constant.js";
import { AuthService } from "./auth/auth.service.js";
import { UsersService } from "./users/users.service.js";
import { PaginatedResponseDto } from "../../libs/pagination/paginated-response.dto.js";
let IdentityMessagesController = class IdentityMessagesController {
    auth;
    users;
    events;
    constructor(auth, users, events) {
        this.auth = auth;
        this.users = users;
        this.events = events;
    }
    register(payload) {
        return this.auth.register(payload);
    }
    login(payload) {
        return this.auth.login(payload);
    }
    async verifyEmail(payload) {
        const user = await this.auth.validateVerificationToken(payload.token);
        const result = await this.auth.verifyEmailAccept(payload.token);
        const event = { userId: user.id, email: user.email };
        this.events.emit(EVENTS.userEmailVerified, event);
        return result;
    }
    declineEmail(payload) {
        return this.auth.verifyEmailDecline(payload.token);
    }
    async findById(payload) {
        return this.users.findById(payload.id);
    }
    async findAll(payload) {
        const page = payload.page ?? 1;
        const limit = payload.limit ?? 10;
        const { data, total } = await this.users.findAll(page, limit, payload.search);
        return new PaginatedResponseDto(data, page, limit, total);
    }
    async update(payload) {
        return this.users.update(payload.userId, payload.dto);
    }
    setImage(payload) {
        return this.users.setImagePath(payload.userId, payload.imagePath);
    }
    setRole(payload) {
        return this.users.setRole(payload.id, payload.role, payload.actingUserId);
    }
    async changePassword(payload) {
        await this.users.changePassword(payload.userId, payload.dto);
        return { ok: true };
    }
    async remove(payload) {
        await this.users.remove(payload.userId);
        return { ok: true };
    }
};
__decorate([
    MessagePattern(RPC.identity.register),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "register", null);
__decorate([
    MessagePattern(RPC.identity.login),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "login", null);
__decorate([
    MessagePattern(RPC.identity.verifyEmail),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "verifyEmail", null);
__decorate([
    MessagePattern(RPC.identity.declineEmail),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "declineEmail", null);
__decorate([
    MessagePattern(RPC.identity.findById),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "findById", null);
__decorate([
    MessagePattern(RPC.identity.findAll),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "findAll", null);
__decorate([
    MessagePattern(RPC.identity.updateMe),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "update", null);
__decorate([
    MessagePattern(RPC.identity.setImage),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "setImage", null);
__decorate([
    MessagePattern(RPC.identity.setRole),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "setRole", null);
__decorate([
    MessagePattern(RPC.identity.changePassword),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "changePassword", null);
__decorate([
    MessagePattern(RPC.identity.deleteMe),
    __param(0, Payload()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityMessagesController.prototype, "remove", null);
IdentityMessagesController = __decorate([
    Controller(),
    __param(2, Inject(EVENTS_CLIENT)),
    __metadata("design:paramtypes", [AuthService,
        UsersService, Function])
], IdentityMessagesController);
export { IdentityMessagesController };
//# sourceMappingURL=identity.controller.js.map