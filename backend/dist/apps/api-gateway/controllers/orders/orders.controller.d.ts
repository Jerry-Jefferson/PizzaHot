import { OrderClient } from "../../clients/order.client.ts";
import type { JwtPayload } from "../../../../libs/auth/jwt-payload.schema.ts";
import { type PaginationQuery } from "../../../../libs/pagination/pagination.schema.ts";
import { CreateOrderDto } from "../../../order-service/dto/create-order.dto.ts";
import { UpdateOrderStatusDto } from "../../../order-service/dto/update-order-status.dto.ts";
import { OrderResponseDto } from "../../../order-service/dto/order-response.dto.ts";
import { PaginatedResponseDto } from "../../../../libs/pagination/paginated-response.dto.ts";
import type { ListOrdersQuery } from "../../../order-service/order.types.ts";
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrderClient);
    create(user: JwtPayload, dto: CreateOrderDto): Promise<OrderResponseDto>;
    getMyOrders(user: JwtPayload, query: PaginationQuery): Promise<PaginatedResponseDto<OrderResponseDto>>;
    getMyOrderById(user: JwtPayload, id: string): Promise<OrderResponseDto>;
    searchOrders(query: ListOrdersQuery): Promise<PaginatedResponseDto<OrderResponseDto>>;
    getOrdersByUser(userId: string, query: PaginationQuery): Promise<PaginatedResponseDto<OrderResponseDto>>;
    getOrderById(id: string): Promise<OrderResponseDto>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<OrderResponseDto>;
}
