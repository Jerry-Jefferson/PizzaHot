import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

import { getMyOrder, listMyOrders } from "@/api/orders";
import type { Paginated, PaginationQuery } from "@/types/api.types";
import type { Order } from "@/types/order.types";
import { isFinalOrderStatus } from "@/utils/constants/order-status";

export const MY_ORDERS_PAGE_SIZE = 10;
export const ORDER_POLL_INTERVAL_MS = 30_000;

interface MyOrdersOptions {
  pollWhileActive?: boolean;
}

export function hasActiveOrders(page: Paginated<Order> | undefined): boolean {
  return page?.data.some((order) => !isFinalOrderStatus(order.status)) ?? false;
}

export function useMyOrders(
  query: MaybeRefOrGetter<PaginationQuery> = {},
  { pollWhileActive = false }: MyOrdersOptions = {}
): UseQueryReturnType<Paginated<Order>, Error> {
  const page = computed(() => toValue(query).page ?? 1);
  const limit = computed(() => toValue(query).limit ?? MY_ORDERS_PAGE_SIZE);

  return useQuery({
    queryKey: ["orders", "my", page, limit],
    queryFn: () => listMyOrders({ page: page.value, limit: limit.value }),
    refetchInterval: (activeQuery) =>
      pollWhileActive && hasActiveOrders(activeQuery.state.data) ? ORDER_POLL_INTERVAL_MS : false,
  });
}

export function useMyOrder(id: MaybeRefOrGetter<string>): UseQueryReturnType<Order, Error> {
  const orderId = computed(() => toValue(id));

  return useQuery({
    queryKey: ["orders", "my", "detail", orderId],
    queryFn: () => getMyOrder(orderId.value),
    refetchInterval: (activeQuery) => {
      const order = activeQuery.state.data;
      return order && !isFinalOrderStatus(order.status) ? ORDER_POLL_INTERVAL_MS : false;
    },
  });
}
