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
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiGetMeAuth, ApiLoginAuth, ApiLogoutAuth, ApiSignupAuth, ApiVerifyEmailAcceptAuth, ApiVerifyEmailDeclineAuth, } from "./auth.api-docs.js";
import { Throttle } from "@nestjs/throttler";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.js";
import { IdentityClient } from "../../clients/identity.client.js";
import { CurrentUser } from "../../../../libs/auth/decorators/current-user.decorator.js";
import { Public } from "../../../../libs/auth/decorators/public.decorator.js";
import { AuthResponseDto } from "../../../identity-service/auth/dto/auth-response.dto.js";
import { LoginDto } from "../../../identity-service/auth/dto/login.dto.js";
import { SignupDto } from "../../../identity-service/auth/dto/signup.dto.js";
import { loginSchema, signupSchema } from "../../../identity-service/auth/schemas/auth.schema.js";
import { COOKIE_MAX_AGE_MS } from "../../../../libs/auth/auth.constant.js";
import { COOKIE_NAME } from "../../../../libs/auth/auth.constant.js";
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async signup(dto, res) {
        const { token, user } = await this.authService.register(dto);
        this.setTokenCookie(res, token);
        return new AuthResponseDto(token, user);
    }
    async verifyEmailAccept(token) {
        return this.authService.verifyEmailAccept(token);
    }
    async verifyEmailDecline(token) {
        return this.authService.verifyEmailDecline(token);
    }
    async login(dto, res) {
        const { token, user } = await this.authService.login(dto);
        this.setTokenCookie(res, token);
        return new AuthResponseDto(token, user);
    }
    async getMe(user) {
        return this.authService.getProfile(user.sub);
    }
    logout(res) {
        res.clearCookie(COOKIE_NAME);
    }
    setTokenCookie(res, token) {
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: COOKIE_MAX_AGE_MS,
        });
    }
};
__decorate([
    Public(),
    Throttle({ default: { limit: 5, ttl: 60000 } }),
    Post("signup"),
    ApiSignupAuth(),
    __param(0, Body(new ZodValidationPipe(signupSchema))),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignupDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    Public(),
    Get("verify-email/accept"),
    ApiVerifyEmailAcceptAuth(),
    __param(0, Query("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmailAccept", null);
__decorate([
    Public(),
    Get("verify-email/decline"),
    ApiVerifyEmailDeclineAuth(),
    __param(0, Query("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmailDecline", null);
__decorate([
    Public(),
    Throttle({ default: { limit: 5, ttl: 60000 } }),
    Post("login"),
    HttpCode(HttpStatus.OK),
    ApiLoginAuth(),
    __param(0, Body(new ZodValidationPipe(loginSchema))),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Get("me"),
    ApiGetMeAuth(),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    Post("logout"),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiLogoutAuth(),
    __param(0, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
AuthController = __decorate([
    ApiTags("Auth"),
    Controller("auth"),
    __metadata("design:paramtypes", [IdentityClient])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map