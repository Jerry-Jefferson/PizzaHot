import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { ApiAuth } from "../../../libs/common/swagger/api-responses.decorator.ts";
import { UserResponseDto } from "../../identity-service/users/dto/user-response.dto.ts";
import { AuthResponseDto } from "../../identity-service/auth/dto/auth-response.dto.ts";
import { LoginDto } from "../../identity-service/auth/dto/login.dto.ts";
import { SignupDto } from "../../identity-service/auth/dto/signup.dto.ts";

export const ApiSignupAuth = () =>
  applyDecorators(
    ApiOperation({ summary: "Register a new user account" }),
    ApiBody({ type: SignupDto }),
    ApiResponse({
      status: 201,
      description: "User registered and authenticated successfully",
      type: AuthResponseDto,
    }),
    ApiResponse({ status: 409, description: "User with this email already exists" })
  );

export const ApiVerifyEmailAcceptAuth = () =>
  applyDecorators(
    ApiOperation({ summary: "Accept email verification" }),
    ApiQuery({ name: "token", type: String, description: "Verification token", required: true }),
    ApiResponse({ status: 200, description: "Email successfully verified" }),
    ApiResponse({ status: 400, description: "Invalid or expired verification token" })
  );

export const ApiVerifyEmailDeclineAuth = () =>
  applyDecorators(
    ApiOperation({ summary: "Decline email verification" }),
    ApiQuery({ name: "token", type: String, description: "Verification token", required: true }),
    ApiResponse({ status: 200, description: "Email verification request declined" }),
    ApiResponse({ status: 400, description: "Invalid or expired verification token" })
  );

export const ApiLoginAuth = () =>
  applyDecorators(
    ApiOperation({ summary: "Log in with email and password" }),
    ApiBody({ type: LoginDto }),
    ApiResponse({ status: 200, description: "Login successful", type: AuthResponseDto }),
    ApiResponse({ status: 401, description: "Invalid email or password" })
  );

export const ApiGetMeAuth = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: "Get the current authenticated user's profile" }),
    ApiResponse({ status: 200, description: "Current user profile", type: UserResponseDto }),
    ApiAuth()
  );

export const ApiLogoutAuth = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: "Log out and clear authentication cookie" }),
    ApiResponse({ status: 204, description: "Logged out successfully" }),
    ApiAuth()
  );
