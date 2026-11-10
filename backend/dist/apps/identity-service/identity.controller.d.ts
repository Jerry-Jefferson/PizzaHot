import type { ClientProxy } from "@nestjs/microservices";
import { AuthService } from "./auth/auth.service.ts";
import { UsersService } from "./users/users.service.ts";
import type { SignUp } from "./auth/schemas/auth.schema.ts";
import type { LoginDto } from "./auth/dto/login.dto.ts";
import type { UpdateUserDto } from "./users/dto/update-user.dto.ts";
import type { ChangePasswordDto } from "./users/dto/change-password.dto.ts";
import { UserResponseDto } from "./users/dto/user-response.dto.ts";
import { PaginatedResponseDto } from "../../libs/pagination/paginated-response.dto.ts";
import type { Role } from "../../libs/auth/auth.constant.ts";
export declare class IdentityMessagesController {
    private readonly auth;
    private readonly users;
    private readonly events;
    constructor(auth: AuthService, users: UsersService, events: ClientProxy);
    register(payload: SignUp): Promise<{
        token: string;
        user: UserResponseDto;
    }>;
    login(payload: LoginDto): Promise<{
        token: string;
        user: UserResponseDto;
    }>;
    verifyEmail(payload: {
        token: string;
    }): Promise<{
        message: string;
    }>;
    declineEmail(payload: {
        token: string;
    }): Promise<{
        message: string;
    }>;
    findById(payload: {
        id: string;
    }): Promise<UserResponseDto>;
    findAll(payload: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<PaginatedResponseDto<UserResponseDto>>;
    update(payload: {
        userId: string;
        dto: UpdateUserDto;
    }): Promise<UserResponseDto>;
    setImage(payload: {
        userId: string;
        imagePath: string;
    }): Promise<UserResponseDto>;
    setRole(payload: {
        id: string;
        role: Role;
        actingUserId: string;
    }): Promise<UserResponseDto>;
    changePassword(payload: {
        userId: string;
        dto: ChangePasswordDto;
    }): Promise<{
        ok: true;
    }>;
    remove(payload: {
        userId: string;
    }): Promise<{
        ok: true;
    }>;
}
