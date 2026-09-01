import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../shared/constants/salt.constants.ts";
import { ChangePasswordDto } from "./dto/change-password.dto.ts";
import { CreateUserDto } from "./dto/create-user.dto.ts";
import { UpdateUserDto } from "./dto/update-user.dto.ts";
import { Role } from "../shared/constants/role.enum.ts";
import { User } from "./entities/user.entity.ts";
import { UsersRepository } from "./users.repository.ts";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.createWithRole(dto, Role.USER);
  }

  async createWithRole(dto: CreateUserDto, role: Role): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      surname: dto.surname,
      gender: dto.gender,
      image: dto.image,
      role,
      isEmailVerified: false,
    });

    return this.usersRepository.save(user);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: User[]; total: number }> {
    return this.usersRepository.findPaginated(page, limit, search);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    const updated = await this.usersRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.usersRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(id);

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.usersRepository.update(id, { passwordHash: newPasswordHash });
  }
}
