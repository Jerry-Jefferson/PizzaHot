import type { ClientProxy } from "@nestjs/microservices";
import type { SignUp } from "../../identity-service/auth/schemas/auth.schema.ts";
import type { LoginDto } from "../../identity-service/auth/dto/login.dto.ts";
import type { UpdateUserDto } from "../../identity-service/users/dto/update-user.dto.ts";
import type { ChangePasswordDto } from "../../identity-service/users/dto/change-password.dto.ts";
import type { UserResponseDto } from "../../identity-service/users/dto/user-response.dto.ts";
import type { PaginatedResponseDto } from "../../../libs/pagination/paginated-response.dto.ts";
import type { Role } from "../../../libs/auth/auth.constant.ts";
export declare class IdentityClient {
    private readonly client;
    constructor(client: ClientProxy);
    register(dto: SignUp): Promise<{
        token: string;
        user: UserResponseDto;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: UserResponseDto;
    }>;
    verifyEmailAccept(token: string): Promise<{
        message: string;
    }>;
    verifyEmailDecline(token: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<UserResponseDto>;
    findById(id: string): Promise<UserResponseDto>;
    findAll(page: number, limit: number, search?: string): Promise<PaginatedResponseDto<UserResponseDto>>;
    update(userId: string, dto: UpdateUserDto): Promise<UserResponseDto>;
    setImage(userId: string, imagePath: string): Promise<UserResponseDto>;
    setRole(id: string, role: Role, actingUserId: string): Promise<UserResponseDto>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        ok: true;
    }>;
    remove(userId: string): Promise<{
        ok: true;
    }>;
}
