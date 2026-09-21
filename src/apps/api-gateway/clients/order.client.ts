import { Inject, Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { ORDER_CLIENT } from "../../../libs/messaging/tokens.constant.ts";
import { RPC } from "../../../libs/contracts/index.ts";
import { rpc } from "../../../libs/messaging/rpc.util.ts";
import type { CreateOrderDto } from "../../order-service/dto/create-order.dto.ts";
import type { OrderStatus } from "../../order-service/constants/order-status.constant.ts";
import type { ListOrdersQuery } from "../../order-service/order.types.ts";
import { OrderResponseDto } from "../../order-service/dto/order-response.dto.ts";
import { PaginatedResponseDto } from "../../../libs/common/pagination/paginated-response.dto.ts";

@Injectable()
export class OrderClient {
  constructor(@Inject(ORDER_CLIENT) private readonly client: ClientProxy) {}

  create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    return rpc(this.client, RPC.order.create, { userId, dto });
  }

  findByUserId(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    return rpc(this.client, RPC.order.findMine, { userId, page, limit });
  }

  findMyOrderById(orderId: string, userId: string): Promise<OrderResponseDto> {
    return rpc(this.client, RPC.order.findMineById, { orderId, userId });
  }

  findById(orderId: string): Promise<OrderResponseDto> {
    return rpc(this.client, RPC.order.findById, { orderId });
  }

  async findAll(query: ListOrdersQuery): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const { data, total } = await rpc<{ data: OrderResponseDto[]; total: number }>(
      this.client,
      RPC.order.findAll,
      query
    );

    return new PaginatedResponseDto(data, query.page, query.limit, total);
  }

  updateStatus(orderId: string, status: OrderStatus): Promise<OrderResponseDto> {
    return rpc(this.client, RPC.order.updateStatus, { orderId, status });
  }
}
