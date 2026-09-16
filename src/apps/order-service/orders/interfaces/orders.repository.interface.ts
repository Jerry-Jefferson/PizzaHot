import type { Order } from "../entities/order.entity.ts";
import type { OrderStatus } from "../constants/order-status.constant.ts";
import type { DeliveryType } from "../constants/delivery-type.constant.ts";
import type { PaymentMethod } from "../constants/payment-method.constant.ts";

import type { DeepPartial } from "../../../../libs/common/common.interface.ts";

export interface FindOrdersFilter {
  page: number;
  limit: number;
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
  findPaginated(filter: FindOrdersFilter): Promise<{ data: Order[]; total: number }>;
  updateStatus(id: string, status: OrderStatus): Promise<boolean>;
  detachUser(userId: string): Promise<number>;
}
