import type { Paginated, PaginationQuery } from "@/types/api.types";
import type { CreateOrderPayload, Order } from "@/types/order.types";

import { apiClient } from ".";

export async function listMyOrders(query: PaginationQuery = {}): Promise<Paginated<Order>> {
  const { data } = await apiClient.get<Paginated<Order>>("/orders/my", { params: query });
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>("/orders", payload);
  return data;
}

export async function getMyOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/my/${id}`);
  return data;
}
