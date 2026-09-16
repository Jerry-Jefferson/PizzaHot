import { Inject, Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { ORDER_CLIENT } from "../../../libs/messaging/tokens.ts";
import { RPC } from "../../../libs/contracts/patterns.ts";
import { rpc } from "../../../libs/messaging/rpc.util.ts";
import type { CreateOrderDto } from "../../order-service/orders/dto/create-order.dto.ts";
import type { OrderStatus } from "../../order-service/orders/constants/order-status.constant.ts";
import type { DeliveryType } from "../../order-service/orders/constants/delivery-type.constant.ts";
import type { PaymentMethod } from "../../order-service/orders/constants/payment-method.constant.ts";
import type { OrderResponseDto } from "../../order-service/orders/dto/order-response.dto.ts";
import type { Order } from "../../order-service/orders/entities/order.entity.ts";
import type { PaginatedResponseDto } from "../../../libs/common/pagination/dto/paginated-response.dto.ts";

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

  findAll(
    page: number,
    limit: number,
    userId?: string,
    status?: OrderStatus,
    delivery?: DeliveryType,
    paymentMethod?: PaymentMethod
  ): Promise<{ data: Order[]; total: number }> {
    return rpc(this.client, RPC.order.findAll, {
      page,
      limit,
      userId,
      status,
      delivery,
      paymentMethod,
    });
  }

  updateStatus(orderId: string, status: OrderStatus): Promise<OrderResponseDto> {
    return rpc(this.client, RPC.order.updateStatus, { orderId, status });
  }
}
