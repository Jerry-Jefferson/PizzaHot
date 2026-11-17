import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

import { searchOrders } from "@/services/api/orders";
import { type Order, type OrderSearchQuery, OrderStatus } from "@/types/order.types";
import type { Paginated } from "@/types/pagination.types";
import { PENDING_ORDERS_REFETCH_MS } from "@/utils/constants/order.constants";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

const PENDING_COUNT_QUERY: OrderSearchQuery = { status: OrderStatus.PENDING, limit: 1 };

export function useOrderSearch(
  query: MaybeRefOrGetter<OrderSearchQuery> = {}
): UseQueryReturnType<Paginated<Order>, Error> {
  const searchQuery = computed(() => toValue(query));

  return useQuery({
    queryKey: QUERY_KEYS.orders.search(searchQuery),
    queryFn: () => searchOrders(searchQuery.value),
  });
}

export function usePendingOrdersCount(): UseQueryReturnType<number, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.orders.search(PENDING_COUNT_QUERY),
    queryFn: () => searchOrders(PENDING_COUNT_QUERY),
    select: (page) => page.total,
    refetchInterval: PENDING_ORDERS_REFETCH_MS,
  });
}
