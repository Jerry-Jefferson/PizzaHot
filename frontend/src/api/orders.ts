import type { Paginated, PaginationQuery } from "@/types/api.types";
import type { Order } from "@/types/order.types";

import { apiClient } from ".";

export async function listMyOrders(query: PaginationQuery = {}): Promise<Paginated<Order>> {
  const { data } = await apiClient.get<Paginated<Order>>("/orders/my", { params: query });
  return data;
}
