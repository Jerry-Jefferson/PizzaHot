import { JwtService } from "@nestjs/jwt";
import { UserResponseDto } from "../users/dto/user-response.dto.ts";
import { User } from "../users/user.entity.ts";
import { UsersService } from "../users/users.service.ts";
import { LoginDto } from "./dto/login.dto.ts";
import type { SignUp } from "./schemas/auth.schema.ts";
import type { ClientProxy } from "@nestjs/microservices";
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly events;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, events: ClientProxy);
    register(dto: SignUp): Promise<{
        token: string;
        user: UserResponseDto;
    }>;
    validateVerificationToken(token: string): Promise<User>;
    verifyEmailAccept(token: string): Promise<{
        message: string;
    }>;
    verifyEmailDecline(token: string): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: UserResponseDto;
    }>;
    getProfile(userId: string): Promise<UserResponseDto>;
    private generateToken;
}
