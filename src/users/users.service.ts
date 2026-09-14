import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
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
import { USERS_REPOSITORY } from "../shared/database/tokens.ts";
import type { IUsersRepository } from "./interfaces/users.repository.interface.ts";
import { NotificationsService } from "../notifications/notifications.service.ts";
import { NotificationType } from "../notifications/constants/notification-type.constant.ts";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly notificationsService: NotificationsService
  ) {}

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
      isEmailVerified: dto.isEmailVerified ?? false,
      verificationToken: dto.verificationToken ?? null,
      verificationTokenExpiresAt: dto.verificationTokenExpiresAt ?? null,
    });

    return this.usersRepository.save(user);
  }

  async setEmailVerified(id: string, isEmailVerified: boolean): Promise<void> {
    await this.usersRepository.update(id, { isEmailVerified });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findByVerificationToken(token);
  }

  async updateVerificationStatus(id: string, data: Partial<User>): Promise<void> {
    await this.usersRepository.update(id, data);
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

    await this.usersRepository.update(id, dto);

    const updated = await this.findById(id);
    this.logger.log(`User profile updated: ${updated.email} (id: ${id})`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    const email = user.email;

    const deleted = await this.usersRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    try {
      await this.notificationsService.send({
        type: NotificationType.ACCOUNT_DELETED,
        recipient: email,
      });
    } catch (error) {
      this.logger.error(`Failed to send account deletion notification to ${email}: ${error}`);
    }

    this.logger.log(`User deleted: ${email} (id: ${id})`);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(id);

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.usersRepository.update(id, { passwordHash: newPasswordHash });
    this.logger.log(`User changed password: ${user.email} (id: ${id})`);
  }
}
