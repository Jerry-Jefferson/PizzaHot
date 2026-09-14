import crypto from "crypto";
import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { UserResponseDto } from "../users/dto/user-response.dto.ts";
import { User } from "../users/entities/user.entity.ts";
import { UsersService } from "../users/users.service.ts";
import { LoginDto } from "./dto/login.dto.ts";
import type { SignUp } from "./schemas/auth.schema.ts";
import { JwtPayload } from "./types/jwt-payload.interface.ts";
import { NotificationsService } from "../notifications/notifications.service.ts";
import { NotificationType } from "../notifications/constants/notification-type.constant.ts";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService
  ) {}

  async register(dto: SignUp): Promise<{ token: string; user: UserResponseDto }> {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      surname: dto.surname,
      gender: dto.gender,
      image: dto.image,
      isEmailVerified: false,
      verificationToken: rawToken,
      verificationTokenExpiresAt: expiresAt,
    });

    const token = this.generateToken(user);

    try {
      await this.notificationsService.send({
        type: NotificationType.EMAIL_VERIFICATION,
        recipient: user.email,
        data: {
          verificationToken: rawToken,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send verification notification to ${user.email}: ${error}`);
    }

    this.logger.log(`User registered: ${user.email} (id: ${user.id})`);

    return { token, user: UserResponseDto.fromEntity(user) };
  }

  async validateVerificationToken(token: string): Promise<User> {
    if (!token || typeof token !== "string" || token.trim() === "") {
      throw new BadRequestException("Invalid or expired verification token");
    }

    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException("Invalid or expired verification token");
    }

    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      await this.usersService.updateVerificationStatus(user.id, {
        verificationToken: null,
        verificationTokenExpiresAt: null,
      });
      throw new BadRequestException("Invalid or expired verification token");
    }

    return user;
  }

  async verifyEmailAccept(token: string): Promise<{ message: string }> {
    const user = await this.validateVerificationToken(token);

    await this.usersService.updateVerificationStatus(user.id, {
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    });

    this.logger.log(`User email verified: ${user.email} (id: ${user.id})`);

    return { message: "Email successfully verified" };
  }

  async verifyEmailDecline(token: string): Promise<{ message: string }> {
    const user = await this.validateVerificationToken(token);

    await this.usersService.updateVerificationStatus(user.id, {
      isEmailVerified: false,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    });

    return { message: "Email verification request declined" };
  }

  async login(dto: LoginDto): Promise<{ token: string; user: UserResponseDto }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const token = this.generateToken(user);
    this.logger.log(`User logged in: ${user.email} (id: ${user.id})`);
    return { token, user: UserResponseDto.fromEntity(user) };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    return UserResponseDto.fromEntity(user);
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
    return this.jwtService.sign(payload);
  }
}
