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
  Query,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ApiChangePasswordUser,
  ApiFindAllUser,
  ApiFindOneUser,
  ApiRemoveMeUser,
  ApiUpdateMeUser,
} from "./users.api-docs.ts";
import { CurrentUser } from "../../../libs/auth/decorators/current-user.decorator.ts";
import type { JwtPayload } from "../../../libs/auth/jwt-payload.schema.ts";
import { PaginatedResponseDto } from "../../../libs/common/pagination/paginated-response.dto.ts";
import { ZodValidationPipe } from "../../../libs/common/pipes/zod-validation.pipe.ts";
import { ChangePasswordDto } from "../../identity-service/users/dto/change-password.dto.ts";
import { UpdateUserDto } from "../../identity-service/users/dto/update-user.dto.ts";
import { UserResponseDto } from "../../identity-service/users/dto/user-response.dto.ts";
import {
  changePasswordSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from "../../identity-service/users/user.schema.ts";
import { IdentityClient } from "../clients/identity.client.ts";
import { Role } from "../../../libs/common/constants/role.constant.ts";
import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { COOKIE_NAME } from "../../../libs/auth/auth.constants.ts";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: IdentityClient) {}

  @Get()
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  @ApiFindOneUser()
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Patch("me")
  @ApiUpdateMeUser()
  async updateMe(
    @CurrentUser() currentUser: JwtPayload,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.usersService.update(currentUser.sub, dto);
  }

  @Patch("me/password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiChangePasswordUser()
  async changePassword(
    @CurrentUser() currentUser: JwtPayload,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto
  ): Promise<void> {
    await this.usersService.changePassword(currentUser.sub, dto);
  }

  @Delete("me")
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
