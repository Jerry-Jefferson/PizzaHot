import { Controller, Inject, Logger } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.ts";
import type { UserEmailVerifiedEvent } from "../../libs/contracts/index.ts";
import { EVENTS_CLIENT } from "../../libs/messaging/tokens.constant.ts";
import { AuthService } from "./auth/auth.service.ts";
import { UsersService } from "./users/users.service.ts";
import type { SignUp } from "./auth/schemas/auth.schema.ts";
import type { LoginDto } from "./auth/dto/login.dto.ts";
import type { UpdateUserDto } from "./users/dto/update-user.dto.ts";
import type { ChangePasswordDto } from "./users/dto/change-password.dto.ts";
import { UserResponseDto } from "./users/dto/user-response.dto.ts";
import { PaginatedResponseDto } from "../../libs/common/pagination/paginated-response.dto.ts";

@Controller()
export class IdentityMessagesController {
  private readonly logger = new Logger(IdentityMessagesController.name);

  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    @Inject(EVENTS_CLIENT)
    private readonly events: ClientProxy
  ) {}

  @MessagePattern(RPC.identity.register)
  register(@Payload() payload: SignUp): Promise<{ token: string; user: UserResponseDto }> {
    return this.auth.register(payload);
  }

  @MessagePattern(RPC.identity.login)
  login(@Payload() payload: LoginDto): Promise<{ token: string; user: UserResponseDto }> {
    return this.auth.login(payload);
  }

  @MessagePattern(RPC.identity.verifyEmail)
  async verifyEmail(@Payload() payload: { token: string }): Promise<{ message: string }> {
    const user = await this.auth.validateVerificationToken(payload.token);
    const result = await this.auth.verifyEmailAccept(payload.token);

    const event: UserEmailVerifiedEvent = { userId: user.id, email: user.email };
    this.events.emit(EVENTS.userEmailVerified, event);

    return result;
  }

  @MessagePattern(RPC.identity.declineEmail)
  declineEmail(@Payload() payload: { token: string }): Promise<{ message: string }> {
    return this.auth.verifyEmailDecline(payload.token);
  }

  @MessagePattern(RPC.identity.findById)
  async findById(@Payload() payload: { id: string }): Promise<UserResponseDto> {
    return this.users.findById(payload.id);
  }

  @MessagePattern(RPC.identity.findAll)
  async findAll(
    @Payload() payload: { page?: number; limit?: number; search?: string }
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 10;
    const { data, total } = await this.users.findAll(page, limit, payload.search);

    return new PaginatedResponseDto(data, page, limit, total);
  }

  @MessagePattern(RPC.identity.updateMe)
  async update(
    @Payload() payload: { userId: string; dto: UpdateUserDto }
  ): Promise<UserResponseDto> {
    return this.users.update(payload.userId, payload.dto);
  }

  @MessagePattern(RPC.identity.changePassword)
  async changePassword(
    @Payload() payload: { userId: string; dto: ChangePasswordDto }
  ): Promise<{ ok: true }> {
    await this.users.changePassword(payload.userId, payload.dto);
    return { ok: true };
  }

  @MessagePattern(RPC.identity.deleteMe)
  async remove(@Payload() payload: { userId: string }): Promise<{ ok: true }> {
    await this.users.remove(payload.userId);
    return { ok: true };
  }
}
