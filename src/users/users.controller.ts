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
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
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

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Get all users (paginated)" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: "Paginated list of users" })
  async findAll(
    @Query(new ZodValidationPipe(listUsersQuerySchema)) query: { page: number; limit: number }
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { data, total } = await this.usersService.findAll(query.page, query.limit);
    return new PaginatedResponseDto(
      data.map((entity) => UserResponseDto.fromEntity(entity)),
      query.page,
      query.limit,
      total
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 200, description: "User found", type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return UserResponseDto.fromEntity(user);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user profile" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: "User updated", type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, dto);
    return UserResponseDto.fromEntity(user);
  }

  @Patch(":id/password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Change user password" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 204, description: "Password changed successfully" })
  @ApiResponse({ status: 401, description: "Current password is incorrect" })
  @ApiResponse({ status: 404, description: "User not found" })
  async changePassword(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto
  ): Promise<void> {
    await this.usersService.changePassword(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 204, description: "User deleted" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
