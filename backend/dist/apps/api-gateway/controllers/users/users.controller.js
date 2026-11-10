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
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Put, Query, Res, UploadedFile, UseInterceptors, } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiChangePasswordUser, ApiFindAllUser, ApiFindOneUser, ApiRemoveMeUser, ApiUpdateMeUser, ApiUpdateUserRole, ApiUploadAvatarUser, } from "./users.api-docs.js";
import { CurrentUser } from "../../../../libs/auth/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.js";
import { ImageCategory, ImageValidationPipe, UPLOADS_URL_PREFIX, imageMulterOptions, } from "../../../../libs/upload/index.js";
import { ChangePasswordDto } from "../../../identity-service/users/dto/change-password.dto.js";
import { UpdateUserDto } from "../../../identity-service/users/dto/update-user.dto.js";
import { changePasswordSchema, listUsersQuerySchema, updateUserSchema, updateUserRoleSchema, } from "../../../identity-service/users/user.schema.js";
import { IdentityClient } from "../../clients/identity.client.js";
import { COOKIE_NAME } from "../../../../libs/auth/auth.constant.js";
import { Can } from "../../../../libs/auth/decorators/can.decorator.js";
import { Permission } from "../../../../libs/auth/permission.constant.js";
import { UpdateUserRoleDto } from "../../../identity-service/users/dto/update-user-role.dto.js";
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(query) {
        return this.usersService.findAll(query.page, query.limit, query.search);
    }
    async findOne(id) {
        return this.usersService.findById(id);
    }
    async updateRole(currentUser, id, dto) {
        return this.usersService.setRole(id, dto.role, currentUser.sub);
    }
    async updateMe(currentUser, dto) {
        return this.usersService.update(currentUser.sub, dto);
    }
    async uploadAvatar(currentUser, image) {
        const imagePath = `${UPLOADS_URL_PREFIX}/${ImageCategory.USERS}/${image.filename}`;
        return this.usersService.setImage(currentUser.sub, imagePath);
    }
    async changePassword(currentUser, dto) {
        await this.usersService.changePassword(currentUser.sub, dto);
    }
    async removeMe(currentUser, res) {
        await this.usersService.remove(currentUser.sub);
        res.clearCookie(COOKIE_NAME);
    }
};
__decorate([
    Get(),
    Can(Permission.USER_READ_ANY),
    ApiFindAllUser(),
    __param(0, Query(new ZodValidationPipe(listUsersQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    Get(":id"),
    Can(Permission.USER_READ_ANY),
    ApiFindOneUser(),
    __param(0, Param("id", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    Patch(":id/role"),
    Can(Permission.USER_ROLE_WRITE),
    ApiUpdateUserRole(),
    __param(0, CurrentUser()),
    __param(1, Param("id", ParseUUIDPipe)),
    __param(2, Body(new ZodValidationPipe(updateUserRoleSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateRole", null);
__decorate([
    Put("me"),
    Can(Permission.USER_MANAGE_OWN),
    ApiUpdateMeUser(),
    __param(0, CurrentUser()),
    __param(1, Body(new ZodValidationPipe(updateUserSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMe", null);
__decorate([
    Patch("me/image"),
    Can(Permission.USER_MANAGE_OWN),
    UseInterceptors(FileInterceptor("image", imageMulterOptions(ImageCategory.USERS))),
    ApiUploadAvatarUser(),
    __param(0, CurrentUser()),
    __param(1, UploadedFile(new ImageValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    Patch("me/password"),
    Can(Permission.USER_MANAGE_OWN),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiChangePasswordUser(),
    __param(0, CurrentUser()),
    __param(1, Body(new ZodValidationPipe(changePasswordSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    Delete("me"),
    Can(Permission.USER_MANAGE_OWN),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiRemoveMeUser(),
    __param(0, CurrentUser()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeMe", null);
UsersController = __decorate([
    ApiTags("Users"),
    ApiBearerAuth(),
    Controller("users"),
    __metadata("design:paramtypes", [IdentityClient])
], UsersController);
export { UsersController };
//# sourceMappingURL=users.controller.js.map