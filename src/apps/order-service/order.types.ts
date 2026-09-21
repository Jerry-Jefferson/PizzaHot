import type { OrderItem } from "./order-items/order-item.entity.ts";
import type { DeepPartial } from "../../libs/database/database.types.ts";
import type { Order } from "./order.entity.ts";
import type { OrderStatus } from "./constants/order-status.constant.ts";
import type { DeliveryType } from "./constants/delivery-type.constant.ts";
import type { PaymentMethod } from "./constants/payment-method.constant.ts";
import type { PaginationQuery } from "../../libs/pagination/pagination.schema.ts";
import type { PaginatedResult } from "../../libs/pagination/pagination.types.ts";

export interface IOrderItemsRepository {
  create(data: DeepPartial<OrderItem>): OrderItem;
  save(item: OrderItem): Promise<OrderItem>;
  saveMany(items: OrderItem[]): Promise<OrderItem[]>;
  findByOrderId(orderId: string): Promise<OrderItem[]>;
  deleteByOrderId(orderId: string): Promise<void>;
}

export interface ListOrdersQuery extends PaginationQuery {
  userId?: string;
  status?: OrderStatus;
  delivery?: DeliveryType;
  paymentMethod?: PaymentMethod;
}

export interface IOrdersRepository {
  create(data: DeepPartial<Order>): Order;
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findPaginated(query: ListOrdersQuery): Promise<PaginatedResult<Order>>;
  updateStatus(id: string, status: OrderStatus): Promise<boolean>;
  detachUser(userId: string): Promise<number>;
}
