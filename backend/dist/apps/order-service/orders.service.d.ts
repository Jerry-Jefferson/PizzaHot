import type { ClientProxy } from "@nestjs/microservices";
import type { IOrderItemsRepository, IOrdersRepository, ListOrdersQuery } from "./order.types.ts";
import { OrderResponseDto } from "./dto/order-response.dto.ts";
import { CreateOrderDto } from "./dto/create-order.dto.ts";
import { OrderStatus } from "./constants/order-status.constant.ts";
import { PaginatedResponseDto } from "../../libs/pagination/paginated-response.dto.ts";
import type { PaginatedResult } from "../../libs/pagination/pagination.types.ts";
export declare class OrdersService {
    private readonly ordersRepository;
    private readonly orderItemsRepository;
    private readonly cartClient;
    private readonly catalogClient;
    private readonly promocodeClient;
    private readonly events;
    private readonly logger;
    constructor(ordersRepository: IOrdersRepository, orderItemsRepository: IOrderItemsRepository, cartClient: ClientProxy, catalogClient: ClientProxy, promocodeClient: ClientProxy, events: ClientProxy);
    create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<PaginatedResponseDto<OrderResponseDto>>;
    findMyOrderById(orderId: string, userId: string): Promise<OrderResponseDto>;
    findById(orderId: string): Promise<OrderResponseDto>;
    findAll(query: ListOrdersQuery): Promise<PaginatedResult<OrderResponseDto>>;
    updateStatus(orderId: string, status: OrderStatus): Promise<OrderResponseDto>;
}
