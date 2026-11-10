import type { ClientProxy } from "@nestjs/microservices";
import { RmqContext } from "@nestjs/microservices";
import type { UserDeletedEvent } from "../../libs/contracts/index.ts";
import { OrdersService } from "./orders.service.ts";
import { OrderResponseDto } from "./dto/order-response.dto.ts";
import type { PaginatedResponseDto } from "../../libs/pagination/paginated-response.dto.ts";
import type { IOrdersRepository, ListOrdersQuery } from "./order.types.ts";
import type { CreateOrderDto } from "./dto/create-order.dto.ts";
import type { OrderStatus } from "./constants/order-status.constant.ts";
import type { PaginatedResult } from "../../libs/pagination/pagination.types.ts";
export declare class OrderMessagesController {
    private readonly orders;
    private readonly ordersRepository;
    private readonly events;
    private readonly logger;
    constructor(orders: OrdersService, ordersRepository: IOrdersRepository, events: ClientProxy);
    create(payload: {
        userId: string;
        dto: CreateOrderDto;
    }): Promise<OrderResponseDto>;
    findMine(payload: {
        userId: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponseDto<OrderResponseDto>>;
    findMineById(payload: {
        userId: string;
        orderId: string;
    }): Promise<OrderResponseDto>;
    findById(payload: {
        orderId: string;
    }): Promise<OrderResponseDto>;
    findAll(payload: Partial<ListOrdersQuery>): Promise<PaginatedResult<OrderResponseDto>>;
    findByUserId(payload: {
        userId: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponseDto<OrderResponseDto>>;
    updateStatus(payload: {
        orderId: string;
        status: OrderStatus;
    }): Promise<OrderResponseDto>;
    onUserDeleted(event: UserDeletedEvent, context: RmqContext): Promise<void>;
}
