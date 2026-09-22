import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  ApiGetMeAuth,
  ApiLoginAuth,
  ApiLogoutAuth,
  ApiSignupAuth,
  ApiVerifyEmailAcceptAuth,
  ApiVerifyEmailDeclineAuth,
} from "./auth.api-docs.ts";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import { UserResponseDto } from "../../../identity-service/users/dto/user-response.dto.ts";
import { ZodValidationPipe } from "../../../../libs/validation/zod-validation.pipe.ts";
import { IdentityClient } from "../../clients/identity.client.ts";
import { CurrentUser } from "../../../../libs/auth/decorators/current-user.decorator.ts";
import { Public } from "../../../../libs/auth/decorators/public.decorator.ts";
import { AuthResponseDto } from "../../../identity-service/auth/dto/auth-response.dto.ts";
import { LoginDto } from "../../../identity-service/auth/dto/login.dto.ts";
import { SignupDto } from "../../../identity-service/auth/dto/signup.dto.ts";
import type { JwtPayload } from "../../../../libs/auth/jwt-payload.schema.ts";
import { loginSchema, signupSchema } from "../../../identity-service/auth/schemas/auth.schema.ts";
import { COOKIE_MAX_AGE_MS } from "../../../../libs/auth/auth.constant.ts";
import { COOKIE_NAME } from "../../../../libs/auth/auth.constant.ts";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: IdentityClient) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("signup")
  @ApiSignupAuth()
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
  @ApiVerifyEmailAcceptAuth()
  async verifyEmailAccept(@Query("token") token: string): Promise<{ message: string }> {
    return this.authService.verifyEmailAccept(token);
  }

  @Public()
  @Get("verify-email/decline")
  @ApiVerifyEmailDeclineAuth()
  async verifyEmailDecline(@Query("token") token: string): Promise<{ message: string }> {
    return this.authService.verifyEmailDecline(token);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiLoginAuth()
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const { token, user } = await this.authService.login(dto);
    this.setTokenCookie(res, token);
    return new AuthResponseDto(token, user);
  }

  @Get("me")
  @ApiGetMeAuth()
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.authService.getProfile(user.sub);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiLogoutAuth()
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
