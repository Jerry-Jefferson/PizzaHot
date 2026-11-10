import { DeepPartial, Repository } from "typeorm";
import { OrderItem } from "./order-item.entity.ts";
import type { IOrderItemsRepository } from "../order.types.ts";
export declare class OrderItemsRepository implements IOrderItemsRepository {
    private readonly repository;
    constructor(repository: Repository<OrderItem>);
    create(data: DeepPartial<OrderItem>): OrderItem;
    save(item: OrderItem): Promise<OrderItem>;
    saveMany(items: OrderItem[]): Promise<OrderItem[]>;
    findByOrderId(orderId: string): Promise<OrderItem[]>;
    deleteByOrderId(orderId: string): Promise<void>;
}
