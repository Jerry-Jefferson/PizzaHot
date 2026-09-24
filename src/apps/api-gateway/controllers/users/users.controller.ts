import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import type { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ApiChangePasswordUser,
  ApiFindAllUser,
  ApiFindOneUser,
  ApiRemoveMeUser,
  ApiUpdateMeUser,
  ApiUpdateUserRole,
  ApiUploadAvatarUser,
} from "./users.api-docs.ts";
import { CurrentUser } from "../../../../libs/auth/decorators/current-user.decorator.ts";
import type { JwtPayload } from "../../../../libs/auth/jwt-payload.schema.ts";
import { PaginatedResponseDto } from "../../../../libs/pagination/paginated-response.dto.ts";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.ts";
import {
  ImageCategory,
  ImageValidationPipe,
  UPLOADS_URL_PREFIX,
  imageMulterOptions,
} from "../../../../libs/upload/index.ts";
import { ChangePasswordDto } from "../../../identity-service/users/dto/change-password.dto.ts";
import { UpdateUserDto } from "../../../identity-service/users/dto/update-user.dto.ts";
import { UserResponseDto } from "../../../identity-service/users/dto/user-response.dto.ts";
import {
  changePasswordSchema,
  listUsersQuerySchema,
  updateUserSchema,
  updateUserRoleSchema,
} from "../../../identity-service/users/user.schema.ts";
import { IdentityClient } from "../../clients/identity.client.ts";
import { COOKIE_NAME } from "../../../../libs/auth/auth.constant.ts";
import { Can } from "../../../../libs/auth/decorators/can.decorator.ts";
import { Permission } from "../../../../libs/auth/permission.constant.ts";
import { UpdateUserRoleDto } from "../../../identity-service/users/dto/update-user-role.dto.ts";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: IdentityClient) {}

  @Get()
  @Can(Permission.USER_READ_ANY)
  @ApiFindAllUser()
  async findAll(
    @Query(new ZodValidationPipe(listUsersQuerySchema))
    query: {
      page: number;
      limit: number;
      search?: string;
    }
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.usersService.findAll(query.page, query.limit, query.search);
  }

  @Get(":id")
  @Can(Permission.USER_READ_ANY)
  @ApiFindOneUser()
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Patch(":id/role")
  @Can(Permission.USER_ROLE_WRITE)
  @ApiUpdateUserRole()
  async updateRole(
    @CurrentUser() currentUser: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserRoleSchema)) dto: UpdateUserRoleDto
  ): Promise<UserResponseDto> {
    return this.usersService.setRole(id, dto.role, currentUser.sub);
  }

  @Put("me")
  @Can(Permission.USER_MANAGE_OWN)
  @ApiUpdateMeUser()
  async updateMe(
    @CurrentUser() currentUser: JwtPayload,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.usersService.update(currentUser.sub, dto);
  }

  @Patch("me/image")
  @Can(Permission.USER_MANAGE_OWN)
  @UseInterceptors(FileInterceptor("image", imageMulterOptions(ImageCategory.USERS)))
  @ApiUploadAvatarUser()
  async uploadAvatar(
    @CurrentUser() currentUser: JwtPayload,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File
  ): Promise<UserResponseDto> {
    const imagePath = `${UPLOADS_URL_PREFIX}/${ImageCategory.USERS}/${image.filename}`;
    return this.usersService.setImage(currentUser.sub, imagePath);
  }

  @Patch("me/password")
  @Can(Permission.USER_MANAGE_OWN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiChangePasswordUser()
  async changePassword(
    @CurrentUser() currentUser: JwtPayload,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto
  ): Promise<void> {
    await this.usersService.changePassword(currentUser.sub, dto);
  }

  @Delete("me")
  @Can(Permission.USER_MANAGE_OWN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRemoveMeUser()
  async removeMe(
    @CurrentUser() currentUser: JwtPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.usersService.remove(currentUser.sub);
    res.clearCookie(COOKIE_NAME);
  }
}
