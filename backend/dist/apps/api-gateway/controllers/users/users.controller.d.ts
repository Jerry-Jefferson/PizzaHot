import type { Response } from "express";
import type { JwtPayload } from "../../../../libs/auth/jwt-payload.schema.ts";
import { PaginatedResponseDto } from "../../../../libs/pagination/paginated-response.dto.ts";
import { ChangePasswordDto } from "../../../identity-service/users/dto/change-password.dto.ts";
import { UpdateUserDto } from "../../../identity-service/users/dto/update-user.dto.ts";
import { UserResponseDto } from "../../../identity-service/users/dto/user-response.dto.ts";
import { IdentityClient } from "../../clients/identity.client.ts";
import { UpdateUserRoleDto } from "../../../identity-service/users/dto/update-user-role.dto.ts";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: IdentityClient);
    findAll(query: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<PaginatedResponseDto<UserResponseDto>>;
    findOne(id: string): Promise<UserResponseDto>;
    updateRole(currentUser: JwtPayload, id: string, dto: UpdateUserRoleDto): Promise<UserResponseDto>;
    updateMe(currentUser: JwtPayload, dto: UpdateUserDto): Promise<UserResponseDto>;
    uploadAvatar(currentUser: JwtPayload, image: Express.Multer.File): Promise<UserResponseDto>;
    changePassword(currentUser: JwtPayload, dto: ChangePasswordDto): Promise<void>;
    removeMe(currentUser: JwtPayload, res: Response): Promise<void>;
}
