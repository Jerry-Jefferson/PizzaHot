import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

import { getMyOrder, listMyOrders } from "@/services/api/orders";
import type { Order } from "@/types/order.types";
import type { Paginated, PaginationQuery } from "@/types/pagination.types";
import { MY_ORDERS_PAGE_SIZE } from "@/utils/constants/order.constants";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";
import { isFinalOrderStatus } from "@/utils/order";
export const ORDER_POLL_INTERVAL_MS = 30_000;

interface MyOrdersOptions {
  pollWhileActive?: boolean;
}

function hasActiveOrders(page: Paginated<Order> | undefined): boolean {
  return page?.data.some((order) => !isFinalOrderStatus(order.status)) ?? false;
}

export function useMyOrders(
  query: MaybeRefOrGetter<PaginationQuery> = {},
  { pollWhileActive = false }: MyOrdersOptions = {}
): UseQueryReturnType<Paginated<Order>, Error> {
  const page = computed(() => toValue(query).page ?? 1);
  const limit = computed(() => toValue(query).limit ?? MY_ORDERS_PAGE_SIZE);

  return useQuery({
    queryKey: QUERY_KEYS.myOrders.list(page, limit),
    queryFn: () => listMyOrders({ page: page.value, limit: limit.value }),
    refetchInterval: (activeQuery) =>
      pollWhileActive && hasActiveOrders(activeQuery.state.data) ? ORDER_POLL_INTERVAL_MS : false,
  });
}

export function useMyOrder(id: MaybeRefOrGetter<string>): UseQueryReturnType<Order, Error> {
  const orderId = computed(() => toValue(id));

  return useQuery({
    queryKey: QUERY_KEYS.myOrders.detail(orderId),
    queryFn: () => getMyOrder(orderId.value),
    refetchInterval: (activeQuery) => {
      const order = activeQuery.state.data;
      return order && !isFinalOrderStatus(order.status) ? ORDER_POLL_INTERVAL_MS : false;
    },
  });
}
