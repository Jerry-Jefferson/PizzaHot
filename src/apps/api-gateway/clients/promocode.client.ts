import { Inject, Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { PROMOCODE_CLIENT } from "../../../libs/messaging/tokens.constant.ts";
import { RPC } from "../../../libs/contracts/index.ts";
import { rpc } from "../../../libs/messaging/rpc.util.ts";
import type { PromocodeResponseDto } from "../../promocode-service/dto/promocode-response.dto.ts";
import type { CreatePromocodeDto } from "../../promocode-service/dto/create-promocode.dto.ts";
import type { UpdatePromocodeDto } from "../../promocode-service/dto/update-promocode.dto.ts";

@Injectable()
export class PromocodeClient {
  constructor(@Inject(PROMOCODE_CLIENT) private readonly client: ClientProxy) {}

  findAll(): Promise<PromocodeResponseDto[]> {
    return rpc(this.client, RPC.promocode.list, {});
  }

  findById(id: string): Promise<PromocodeResponseDto> {
    return rpc(this.client, RPC.promocode.findById, { id });
  }

  create(dto: CreatePromocodeDto): Promise<PromocodeResponseDto> {
    return rpc(this.client, RPC.promocode.create, dto);
  }

  update(id: string, dto: UpdatePromocodeDto): Promise<PromocodeResponseDto> {
    return rpc(this.client, RPC.promocode.update, { id, dto });
  }

  remove(id: string): Promise<{ ok: true }> {
    return rpc(this.client, RPC.promocode.remove, { id });
  }

  restore(id: string): Promise<PromocodeResponseDto> {
    return rpc(this.client, RPC.promocode.restore, { id });
  }
}
