import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { ApiNotFound } from "../../../../libs/swagger/api-crud.decorator.ts";
import {
  ApiAdminOnly,
  ApiAuth,
  ApiPaginationQuery,
} from "../../../../libs/swagger/api-responses.decorator.ts";
import { PaginatedResponseDto } from "../../../../libs/pagination/paginated-response.dto.ts";
import { ChangePasswordDto } from "../../../identity-service/users/dto/change-password.dto.ts";
import { UpdateUserDto } from "../../../identity-service/users/dto/update-user.dto.ts";
import { UserResponseDto } from "../../../identity-service/users/dto/user-response.dto.ts";
import { UpdateUserRoleDto } from "../../../identity-service/users/dto/update-user-role.dto.ts";

export const ApiFindAllUser = () =>
  applyDecorators(
    ApiOperation({ summary: "Get all users (paginated)" }),
    ApiPaginationQuery(),
    ApiQuery({ name: "search", required: false, type: String }),
    ApiResponse({
      status: 200,
      description: "Paginated list of users",
      type: PaginatedResponseDto,
    }),
    ApiAdminOnly()
  );

export const ApiFindOneUser = () =>
  applyDecorators(
    ApiOperation({ summary: "Get user by ID" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiResponse({ status: 200, description: "User found", type: UserResponseDto }),
    ApiAdminOnly(),
    ApiNotFound("User")
  );

export const ApiUpdateMeUser = () =>
  applyDecorators(
    ApiOperation({ summary: "Update your profile" }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({ status: 200, description: "Profile updated", type: UserResponseDto }),
    ApiAuth()
  );

export const ApiUpdateUserRole = () =>
  applyDecorators(
    ApiOperation({ summary: "Change a user's role (Admin only)" }),
    ApiParam({ name: "id", type: "string", format: "uuid" }),
    ApiBody({ type: UpdateUserRoleDto }),
    ApiResponse({ status: 200, description: "Role updated", type: UserResponseDto }),
    ApiResponse({
      status: 400,
      description: "Cannot change your own role, or demote the last admin",
    }),
    ApiAdminOnly(),
    ApiNotFound("User")
  );

export const ApiUploadAvatarUser = () =>
  applyDecorators(
    ApiOperation({ summary: "Upload or replace your avatar" }),
    ApiConsumes("multipart/form-data"),
    ApiBody({
      description: "Avatar image file",
      schema: {
        type: "object",
        required: ["image"],
        properties: {
          image: {
            type: "string",
            format: "binary",
            description: "Avatar image file (jpeg, png, webp)",
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: "Avatar successfully uploaded",
      type: UserResponseDto,
    }),
    ApiResponse({ status: 400, description: "Bad request - invalid file" }),
    ApiAuth()
  );

export const ApiChangePasswordUser = () =>
  applyDecorators(
    ApiOperation({ summary: "Change your password" }),
    ApiBody({ type: ChangePasswordDto }),
    ApiResponse({ status: 204, description: "Password changed successfully" }),
    ApiResponse({ status: 401, description: "Current password is incorrect" })
  );

export const ApiRemoveMeUser = () =>
  applyDecorators(
    ApiOperation({ summary: "Delete your account" }),
    ApiResponse({ status: 204, description: "Account deleted" }),
    ApiAuth()
  );
