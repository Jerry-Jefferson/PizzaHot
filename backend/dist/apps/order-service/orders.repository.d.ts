import { DeepPartial, Repository } from "typeorm";
import { Order } from "./order.entity.ts";
import { OrderStatus } from "./constants/order-status.constant.ts";
import type { IOrdersRepository, ListOrdersQuery } from "./order.types.ts";
import type { PaginatedResult } from "../../libs/pagination/pagination.types.ts";
export declare class OrdersRepository implements IOrdersRepository {
    private readonly repository;
    constructor(repository: Repository<Order>);
    create(data: DeepPartial<Order>): Order;
    save(order: Order): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findByUserId(userId: string): Promise<Order[]>;
    findPaginated(query: ListOrdersQuery): Promise<PaginatedResult<Order>>;
    updateStatus(id: string, status: OrderStatus): Promise<boolean>;
    detachUser(userId: string): Promise<number>;
}
