import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import { UserResponseDto } from "../users/dto/user-response.dto.ts";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe.ts";
import { AuthService } from "./auth.service.ts";
import { CurrentUser } from "./decorators/current-user.decorator.ts";
import { Public } from "./decorators/public.decorator.ts";
import { AuthResponseDto } from "./dto/auth-response.dto.ts";
import { LoginDto } from "./dto/login.dto.ts";
import { SignupDto } from "./dto/signup.dto.ts";
import type { JwtPayload } from "./types/jwt-payload.interface.ts";
import { loginSchema, signupSchema } from "./schemas/auth.schema.ts";
import { COOKIE_MAX_AGE_MS } from "./constants/auth.constants.ts";
import { COOKIE_NAME } from "../shared/constants/cookie.constants.ts";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("signup")
  @ApiOperation({ summary: "Register a new user account" })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: "User registered and authenticated successfully",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: "User with this email already exists" })
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) dto: SignupDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const { token, user } = await this.authService.register(dto);
    this.setTokenCookie(res, token);
    return new AuthResponseDto(token, user);
  }

  @Public()
  @Get("verify-email/accept")
  @ApiOperation({ summary: "Accept email verification" })
  @ApiQuery({ name: "token", type: String, description: "Verification token", required: true })
  @ApiResponse({ status: 200, description: "Email successfully verified" })
  @ApiResponse({ status: 400, description: "Invalid or expired verification token" })
  async verifyEmailAccept(@Query("token") token: string): Promise<{ message: string }> {
    return this.authService.verifyEmailAccept(token);
  }

  @Public()
  @Get("verify-email/decline")
  @ApiOperation({ summary: "Decline email verification" })
  @ApiQuery({ name: "token", type: String, description: "Verification token", required: true })
  @ApiResponse({ status: 200, description: "Email verification request declined" })
  @ApiResponse({ status: 400, description: "Invalid or expired verification token" })
  async verifyEmailDecline(@Query("token") token: string): Promise<{ message: string }> {
    return this.authService.verifyEmailDecline(token);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log in with email and password" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "Login successful", type: AuthResponseDto })
  @ApiResponse({ status: 401, description: "Invalid email or password" })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const { token, user } = await this.authService.login(dto);
    this.setTokenCookie(res, token);
    return new AuthResponseDto(token, user);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current authenticated user's profile" })
  @ApiResponse({ status: 200, description: "Current user profile", type: UserResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.authService.getProfile(user.sub);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Log out and clear authentication cookie" })
  @ApiResponse({ status: 204, description: "Logged out successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(COOKIE_NAME);
  }

  private setTokenCookie(res: Response, token: string): void {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }
}
