import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "./constants/salt.constant.ts";
import { ChangePasswordDto } from "./dto/change-password.dto.ts";
import { CreateUserDto } from "./dto/create-user.dto.ts";
import { UpdateUserDto } from "./dto/update-user.dto.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";
import { User } from "./user.entity.ts";
import { USERS_REPOSITORY } from "../../../libs/database/tokens.ts";
import type { IUsersRepository } from "./user.types.ts";
import type { ClientProxy } from "@nestjs/microservices";
import { EVENTS } from "../../../libs/contracts/index.ts";
import type { CriticalErrorEvent, UserDeletedEvent } from "../../../libs/contracts/index.ts";
import { EVENTS_CLIENT } from "../../../libs/messaging/tokens.constant.ts";
import { UserResponseDto } from "./dto/user-response.dto.ts";
import { IMAGE_STORAGE } from "../../../libs/upload/index.ts";
import type { IImageStorage } from "../../../libs/upload/index.ts";
import type { PaginatedResult } from "../../../libs/pagination/pagination.types.ts";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    @Inject(EVENTS_CLIENT)
    private readonly events: ClientProxy,
    @Inject(IMAGE_STORAGE)
    private readonly images: IImageStorage
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
  ): Promise<PaginatedResult<UserResponseDto>> {
    const { data, total } = await this.usersRepository.findPaginated(page, limit, search);
    return { data: UserResponseDto.fromEntities(data), total };
  }

  /**
   * Entity form, for code inside this service that needs fields the response hides -
   * changePassword compares against passwordHash. Callers answering a message want
   * findById instead.
   */
  async findEntityById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  async findById(id: string): Promise<UserResponseDto> {
    // Mapping is not optional here: User is structurally assignable to the response DTO,
    // so returning the entity would compile and quietly put passwordHash on the wire.
    return UserResponseDto.fromEntity(await this.findEntityById(id));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findById(id);

    await this.usersRepository.update(id, dto);

    const updated = await this.findById(id);
    this.logger.log(`User profile updated: ${updated.email} (id: ${id})`);
    return updated;
  }

  /**
   * Same shape as the pizza flow: the file is on disk before the handler runs, so every exit
   * that does not end with the path in the database has to take the file back down.
   */
  async setImagePath(id: string, imagePath: string): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      await this.images.remove(imagePath);
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    if (existing.image !== imagePath) {
      const oldAvatarWasThere = await this.images.remove(existing.image);
      if (existing.image && !oldAvatarWasThere) {
        this.notifyMissingAvatar(existing, "replaced");
      }
    }

    await this.usersRepository.update(id, { image: imagePath });

    this.logger.log(`User avatar updated: ${existing.email} (id: ${id})`);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findEntityById(id);
    const email = user.email;

    // The avatar goes with the account. A failure here must not block the deletion, so it is
    // logged rather than thrown: an orphaned file costs disk, a blocked deletion costs trust.
    try {
      const avatarWasThere = await this.images.remove(user.image);
      if (user.image && !avatarWasThere) {
        this.notifyMissingAvatar(user, "deleted");
      }
    } catch (error) {
      this.logger.error(`Failed to delete avatar of ${email}: ${String(error)}`);
    }

    const deleted = await this.usersRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    const event: UserDeletedEvent = { userId: id, email, name: null };

    try {
      this.events.emit(EVENTS.userDeleted, event);
    } catch (error) {
      this.logger.error(`Failed to publish user.deleted for ${email}: ${String(error)}`);
    }

    this.logger.log(`User deleted: ${email} (id: ${id})`);
  }

  /** Same signal as the pizza flow: the database named a file that the disk does not have. */
  private notifyMissingAvatar(user: User, action: "deleted" | "replaced"): void {
    const event: CriticalErrorEvent = {
      message: `Avatar file of user ${user.email} (${user.id}) was already missing when it was ${action}. The database pointed at ${user.image}. An unreferenced file may be left in uploads.`,
      errorType: "UserAvatarMissing",
      path: user.image ?? undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      this.events.emit(EVENTS.criticalError, event);
    } catch (error) {
      this.logger.error(`Failed to publish missing avatar alert: ${String(error)}`);
    }
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findEntityById(id);

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.usersRepository.update(id, { passwordHash: newPasswordHash });
    this.logger.log(`User changed password: ${user.email} (id: ${id})`);
  }
}
