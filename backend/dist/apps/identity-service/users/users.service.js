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
var UsersService_1;
import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException, } from "@nestjs/common";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "./constants/salt.constant.js";
import { Role } from "../../../libs/auth/auth.constant.js";
import { USERS_REPOSITORY } from "../../../libs/database/tokens.js";
import { EVENTS } from "../../../libs/contracts/index.js";
import { EVENTS_CLIENT } from "../../../libs/messaging/tokens.constant.js";
import { UserResponseDto } from "./dto/user-response.dto.js";
import { IMAGE_STORAGE } from "../../../libs/upload/index.js";
let UsersService = UsersService_1 = class UsersService {
    usersRepository;
    events;
    images;
    logger = new Logger(UsersService_1.name);
    constructor(usersRepository, events, images) {
        this.usersRepository = usersRepository;
        this.events = events;
        this.images = images;
    }
    async create(dto) {
        return this.createWithRole(dto, Role.USER);
    }
    async createWithRole(dto, role) {
        const existing = await this.usersRepository.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException("User with this email already exists");
        }
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = this.usersRepository.create({
            email: dto.email,
            passwordHash,
            name: dto.name,
            surname: dto.surname,
            gender: dto.gender,
            role,
            isEmailVerified: dto.isEmailVerified ?? false,
            verificationToken: dto.verificationToken ?? null,
            verificationTokenExpiresAt: dto.verificationTokenExpiresAt ?? null,
        });
        return this.usersRepository.save(user);
    }
    async setEmailVerified(id, isEmailVerified) {
        await this.usersRepository.update(id, { isEmailVerified });
    }
    async findByVerificationToken(token) {
        return this.usersRepository.findByVerificationToken(token);
    }
    async updateVerificationStatus(id, data) {
        await this.usersRepository.update(id, data);
    }
    async findAll(page, limit, search) {
        const { data, total } = await this.usersRepository.findPaginated(page, limit, search);
        return { data: UserResponseDto.fromEntities(data), total };
    }
    async findEntityById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`User with id "${id}" not found`);
        }
        return user;
    }
    async findById(id) {
        return UserResponseDto.fromEntity(await this.findEntityById(id));
    }
    async findByEmail(email) {
        return this.usersRepository.findByEmail(email);
    }
    async update(id, dto) {
        await this.findById(id);
        await this.usersRepository.update(id, dto);
        const updated = await this.findById(id);
        this.logger.log(`User profile updated: ${updated.email} (id: ${id})`);
        return updated;
    }
    async setImagePath(id, imagePath) {
        const existing = await this.usersRepository.findById(id);
        if (!existing) {
            await this.images.remove(imagePath);
            throw new NotFoundException(`User with id "${id}" not found`);
        }
        if (existing.image !== imagePath) {
            const oldAvatarWasThere = await this.images.remove(existing.image);
            if (existing.image && !oldAvatarWasThere) {
                this.notifyMissingAvatar(existing, "replaced");
            }
        }
        await this.usersRepository.update(id, { image: imagePath });
        this.logger.log(`User avatar updated: ${existing.email} (id: ${id})`);
        return this.findById(id);
    }
    async setRole(id, role, actingUserId) {
        const user = await this.findEntityById(id);
        if (user.role === role) {
            return UserResponseDto.fromEntity(user);
        }
        if (id === actingUserId) {
            throw new BadRequestException("You cannot change your own role");
        }
        if (user.role === Role.ADMIN) {
            const admins = await this.usersRepository.countByRole(Role.ADMIN);
            if (admins <= 1) {
                throw new BadRequestException("Cannot demote the last remaining admin");
            }
        }
        await this.usersRepository.update(id, { role });
        this.logger.log(`Role changed: ${user.email} (id: ${id}) ${user.role} -> ${role}`);
        return this.findById(id);
    }
    async remove(id) {
        const user = await this.findEntityById(id);
        const email = user.email;
        try {
            const avatarWasThere = await this.images.remove(user.image);
            if (user.image && !avatarWasThere) {
                this.notifyMissingAvatar(user, "deleted");
            }
        }
        catch (error) {
            this.logger.error(`Failed to delete avatar of ${email}: ${String(error)}`);
        }
        const deleted = await this.usersRepository.remove(id);
        if (!deleted) {
            throw new NotFoundException(`User with id "${id}" not found`);
        }
        const event = { userId: id, email, name: null };
        try {
            this.events.emit(EVENTS.userDeleted, event);
        }
        catch (error) {
            this.logger.error(`Failed to publish user.deleted for ${email}: ${String(error)}`);
        }
        this.logger.log(`User deleted: ${email} (id: ${id})`);
    }
    notifyMissingAvatar(user, action) {
        const event = {
            message: `Avatar file of user ${user.email} (${user.id}) was already missing when it was ${action}. The database pointed at ${user.image}. An unreferenced file may be left in uploads.`,
            errorType: "UserAvatarMissing",
            path: user.image ?? undefined,
            timestamp: new Date().toISOString(),
        };
        try {
            this.events.emit(EVENTS.criticalError, event);
        }
        catch (error) {
            this.logger.error(`Failed to publish missing avatar alert: ${String(error)}`);
        }
    }
    async changePassword(id, dto) {
        const user = await this.findEntityById(id);
        const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
        await this.usersRepository.update(id, { passwordHash: newPasswordHash });
        this.logger.log(`User changed password: ${user.email} (id: ${id})`);
    }
};
UsersService = UsersService_1 = __decorate([
    Injectable(),
    __param(0, Inject(USERS_REPOSITORY)),
    __param(1, Inject(EVENTS_CLIENT)),
    __param(2, Inject(IMAGE_STORAGE)),
    __metadata("design:paramtypes", [Object, Function, Object])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map