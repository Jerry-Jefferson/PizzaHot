import type { Response } from "express";
import { UserResponseDto } from "../../../identity-service/users/dto/user-response.dto.ts";
import { IdentityClient } from "../../clients/identity.client.ts";
import { AuthResponseDto } from "../../../identity-service/auth/dto/auth-response.dto.ts";
import { LoginDto } from "../../../identity-service/auth/dto/login.dto.ts";
import { SignupDto } from "../../../identity-service/auth/dto/signup.dto.ts";
import type { JwtPayload } from "../../../../libs/auth/jwt-payload.schema.ts";
export declare class AuthController {
    private readonly authService;
    constructor(authService: IdentityClient);
    signup(dto: SignupDto, res: Response): Promise<AuthResponseDto>;
    verifyEmailAccept(token: string): Promise<{
        message: string;
    }>;
    verifyEmailDecline(token: string): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<AuthResponseDto>;
    getMe(user: JwtPayload): Promise<UserResponseDto>;
    logout(res: Response): void;
    private setTokenCookie;
}
