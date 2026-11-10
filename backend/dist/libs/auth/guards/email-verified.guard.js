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
var EmailVerifiedGuard_1;
import { ForbiddenException, Inject, Injectable, Logger, } from "@nestjs/common";
import { IDENTITY_CLIENT } from "../../messaging/tokens.constant.js";
import { RPC } from "../../contracts/patterns.constant.js";
import { rpc } from "../../messaging/rpc.util.js";
let EmailVerifiedGuard = EmailVerifiedGuard_1 = class EmailVerifiedGuard {
    identityClient;
    logger = new Logger(EmailVerifiedGuard_1.name);
    constructor(identityClient) {
        this.identityClient = identityClient;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new ForbiddenException("User is not authenticated");
        }
        if (user.isEmailVerified) {
            return true;
        }
        if (user.sub) {
            try {
                const dbUser = await rpc(this.identityClient, RPC.identity.findById, { id: user.sub });
                if (dbUser?.isEmailVerified) {
                    user.isEmailVerified = true;
                    return true;
                }
            }
            catch (error) {
                this.logger.error(`Failed to check email verification for user ${user.sub}`, error instanceof Error ? error.stack : String(error));
            }
        }
        throw new ForbiddenException("Email is not verified. Please verify your email first.");
    }
};
EmailVerifiedGuard = EmailVerifiedGuard_1 = __decorate([
    Injectable(),
    __param(0, Inject(IDENTITY_CLIENT)),
    __metadata("design:paramtypes", [Object])
], EmailVerifiedGuard);
export { EmailVerifiedGuard };
//# sourceMappingURL=email-verified.guard.js.map