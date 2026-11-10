var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtAuthGuard_1;
import { Injectable, Logger, UnauthorizedException, } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { COOKIE_NAME, IS_PUBLIC_KEY } from "../auth.constant.js";
import { jwtPayloadSchema } from "../jwt-payload.schema.js";
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard {
    jwtService;
    reflector;
    logger = new Logger(JwtAuthGuard_1.name);
    constructor(jwtService, reflector) {
        this.jwtService = jwtService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token) {
            throw new UnauthorizedException("Missing authentication token");
        }
        let claims;
        try {
            claims = await this.jwtService.verifyAsync(token);
        }
        catch {
            throw new UnauthorizedException("Invalid or expired token");
        }
        const parsed = jwtPayloadSchema.safeParse(claims);
        if (!parsed.success) {
            const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
            this.logger.warn(`Rejected a token whose claims do not match the expected shape: ${fields}`);
            throw new UnauthorizedException("Token claims are not recognised");
        }
        request.user = parsed.data;
        return true;
    }
    extractToken(request) {
        return this.extractTokenFromCookie(request) ?? this.extractTokenFromHeader(request);
    }
    extractTokenFromCookie(request) {
        return request.cookies?.[COOKIE_NAME];
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
};
JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [JwtService,
        Reflector])
], JwtAuthGuard);
export { JwtAuthGuard };
//# sourceMappingURL=jwt-auth.guard.js.map