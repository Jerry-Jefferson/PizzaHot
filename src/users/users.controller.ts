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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator.ts";
import type { JwtPayload } from "../auth/types/jwt-payload.interface.ts";
import { PaginatedResponseDto } from "../shared/pagination/dto/paginated-response.dto.ts";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe.ts";
import { ChangePasswordDto } from "./dto/change-password.dto.ts";
import { UpdateUserDto } from "./dto/update-user.dto.ts";
import { UserResponseDto } from "./dto/user-response.dto.ts";
import {
  changePasswordSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from "./schemas/user.schema.ts";
import { UsersService } from "./users.service.ts";
import { Role } from "../shared/constants/role.enum.ts";
import { Roles } from "../auth/decorators/roles.decorator.ts";
import { COOKIE_NAME } from "../shared/constants/cookie.constants.ts";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get all users (paginated)" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({ status: 200, description: "Paginated list of users", type: PaginatedResponseDto })
  async findAll(
    @Query(new ZodValidationPipe(listUsersQuerySchema))
    query: {
      page: number;
      limit: number;
      search?: string;
    }
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { data, total } = await this.usersService.findAll(query.page, query.limit, query.search);
    return new PaginatedResponseDto(
      data.map((user) => UserResponseDto.fromEntity(user)),
      query.page,
      query.limit,
      total
    );
  }

  @Get(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 200, description: "User found", type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return UserResponseDto.fromEntity(user);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update your profile" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: "Profile updated", type: UserResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async updateMe(
    @CurrentUser() currentUser: JwtPayload,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(currentUser.sub, dto);
    return UserResponseDto.fromEntity(user);
  }

  @Patch("me/password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Change your password" })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 204, description: "Password changed successfully" })
  @ApiResponse({ status: 401, description: "Current password is incorrect" })
  async changePassword(
    @CurrentUser() currentUser: JwtPayload,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto
  ): Promise<void> {
    await this.usersService.changePassword(currentUser.sub, dto);
  }

  @Delete("me")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete your account" })
  @ApiResponse({ status: 204, description: "Account deleted" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async removeMe(
    @CurrentUser() currentUser: JwtPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.usersService.remove(currentUser.sub);
    res.clearCookie(COOKIE_NAME);
  }
}
