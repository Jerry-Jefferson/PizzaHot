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
var AuthService_1;
import crypto from "crypto";
import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { UserResponseDto } from "../users/dto/user-response.dto.js";
import { UsersService } from "../users/users.service.js";
import { Inject } from "@nestjs/common";
import { EVENTS } from "../../../libs/contracts/index.js";
import { EVENTS_CLIENT } from "../../../libs/messaging/tokens.constant.js";
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    events;
    logger = new Logger(AuthService_1.name);
    constructor(usersService, jwtService, events) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.events = events;
    }
    async register(dto) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        const user = await this.usersService.create({
            email: dto.email,
            password: dto.password,
            name: dto.name,
            surname: dto.surname,
            gender: dto.gender,
            isEmailVerified: false,
            verificationToken: rawToken,
            verificationTokenExpiresAt: expiresAt,
        });
        const token = this.generateToken(user);
        const event = {
            userId: user.id,
            email: user.email,
            name: user.name,
            verificationToken: rawToken,
        };
        try {
            this.events.emit(EVENTS.userRegistered, event);
        }
        catch (error) {
            this.logger.error(`Failed to publish user.registered for ${user.email}: ${String(error)}`);
        }
        this.logger.log(`User registered: ${user.email} (id: ${user.id})`);
        return { token, user: UserResponseDto.fromEntity(user) };
    }
    async validateVerificationToken(token) {
        if (!token || typeof token !== "string" || token.trim() === "") {
            throw new BadRequestException("Invalid or expired verification token");
        }
        const user = await this.usersService.findByVerificationToken(token);
        if (!user) {
            throw new BadRequestException("Invalid or expired verification token");
        }
        if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
            await this.usersService.updateVerificationStatus(user.id, {
                verificationToken: null,
                verificationTokenExpiresAt: null,
            });
            throw new BadRequestException("Invalid or expired verification token");
        }
        return user;
    }
    async verifyEmailAccept(token) {
        const user = await this.validateVerificationToken(token);
        await this.usersService.updateVerificationStatus(user.id, {
            isEmailVerified: true,
            verificationToken: null,
            verificationTokenExpiresAt: null,
        });
        this.logger.log(`User email verified: ${user.email} (id: ${user.id})`);
        return { message: "Email successfully verified" };
    }
    async verifyEmailDecline(token) {
        const user = await this.validateVerificationToken(token);
        await this.usersService.updateVerificationStatus(user.id, {
            isEmailVerified: false,
            verificationToken: null,
            verificationTokenExpiresAt: null,
        });
        return { message: "Email verification request declined" };
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException("Invalid email or password");
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid email or password");
        }
        const token = this.generateToken(user);
        this.logger.log(`User logged in: ${user.email} (id: ${user.id})`);
        return { token, user: UserResponseDto.fromEntity(user) };
    }
    async getProfile(userId) {
        return this.usersService.findById(userId);
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        };
        return this.jwtService.sign(payload);
    }
};
AuthService = AuthService_1 = __decorate([
    Injectable(),
    __param(2, Inject(EVENTS_CLIENT)),
    __metadata("design:paramtypes", [UsersService,
        JwtService, Function])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map