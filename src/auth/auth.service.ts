import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { UserResponseDto } from "../users/dto/user-response.dto.ts";
import { User } from "../users/entities/user.entity.ts";
import { UsersService } from "../users/users.service.ts";
import { LoginDto } from "./dto/login.dto.ts";
import type { SignUp } from "./schemas/auth.schema.ts";
import { JwtPayload } from "./types/jwt-payload.interface.ts";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) { }

  async register(dto: SignUp): Promise<{ token: string; user: UserResponseDto }> {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      surname: dto.surname,
      gender: dto.gender,
      image: dto.image,
      isEmailVerified: false
    });

    const token = this.generateToken(user);
    return { token, user: UserResponseDto.fromEntity(user) };
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
