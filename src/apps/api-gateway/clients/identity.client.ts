import { Inject, Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { IDENTITY_CLIENT } from "../../../libs/messaging/tokens.constant.ts";
import { RPC } from "../../../libs/contracts/index.ts";
import { rpc } from "../../../libs/messaging/rpc.util.ts";
import type { SignUp } from "../../identity-service/auth/schemas/auth.schema.ts";
import type { LoginDto } from "../../identity-service/auth/dto/login.dto.ts";
import type { UpdateUserDto } from "../../identity-service/users/dto/update-user.dto.ts";
import type { ChangePasswordDto } from "../../identity-service/users/dto/change-password.dto.ts";
import type { UserResponseDto } from "../../identity-service/users/dto/user-response.dto.ts";
import type { PaginatedResponseDto } from "../../../libs/pagination/paginated-response.dto.ts";

@Injectable()
export class IdentityClient {
  constructor(@Inject(IDENTITY_CLIENT) private readonly client: ClientProxy) {}

  register(dto: SignUp): Promise<{ token: string; user: UserResponseDto }> {
    return rpc(this.client, RPC.identity.register, dto);
  }

  login(dto: LoginDto): Promise<{ token: string; user: UserResponseDto }> {
    return rpc(this.client, RPC.identity.login, dto);
  }

  verifyEmailAccept(token: string): Promise<{ message: string }> {
    return rpc(this.client, RPC.identity.verifyEmail, { token });
  }

  verifyEmailDecline(token: string): Promise<{ message: string }> {
    return rpc(this.client, RPC.identity.declineEmail, { token });
  }

  getProfile(userId: string): Promise<UserResponseDto> {
    return rpc(this.client, RPC.identity.findById, { id: userId });
  }

  findById(id: string): Promise<UserResponseDto> {
    return rpc(this.client, RPC.identity.findById, { id });
  }

  findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return rpc(this.client, RPC.identity.findAll, { page, limit, search });
  }

  update(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    return rpc(this.client, RPC.identity.updateMe, { userId, dto });
  }

  setImage(userId: string, imagePath: string): Promise<UserResponseDto> {
    return rpc(this.client, RPC.identity.setImage, { userId, imagePath });
  }

  changePassword(userId: string, dto: ChangePasswordDto): Promise<{ ok: true }> {
    return rpc(this.client, RPC.identity.changePassword, { userId, dto });
  }

  remove(userId: string): Promise<{ ok: true }> {
    return rpc(this.client, RPC.identity.deleteMe, { userId });
  }
}
