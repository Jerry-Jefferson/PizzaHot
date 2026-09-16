import type { OrderItem } from "../entities/order-item.entity.ts";
import type { DeepPartial } from "../../../../libs/common/common.interface.ts";

export interface IOrderItemsRepository {
  create(data: DeepPartial<OrderItem>): OrderItem;
  save(item: OrderItem): Promise<OrderItem>;
  saveMany(items: OrderItem[]): Promise<OrderItem[]>;
  findByOrderId(orderId: string): Promise<OrderItem[]>;
  deleteByOrderId(orderId: string): Promise<void>;
}
