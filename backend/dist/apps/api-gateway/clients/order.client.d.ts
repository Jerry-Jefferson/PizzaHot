import type { ClientProxy } from "@nestjs/microservices";
import type { CreateOrderDto } from "../../order-service/dto/create-order.dto.ts";
import type { OrderStatus } from "../../order-service/constants/order-status.constant.ts";
import type { ListOrdersQuery } from "../../order-service/order.types.ts";
import { OrderResponseDto } from "../../order-service/dto/order-response.dto.ts";
import { PaginatedResponseDto } from "../../../libs/pagination/paginated-response.dto.ts";
export declare class OrderClient {
    private readonly client;
    constructor(client: ClientProxy);
    create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<PaginatedResponseDto<OrderResponseDto>>;
    findMyOrderById(orderId: string, userId: string): Promise<OrderResponseDto>;
    findById(orderId: string): Promise<OrderResponseDto>;
    findAll(query: ListOrdersQuery): Promise<PaginatedResponseDto<OrderResponseDto>>;
    updateStatus(orderId: string, status: OrderStatus): Promise<OrderResponseDto>;
}
