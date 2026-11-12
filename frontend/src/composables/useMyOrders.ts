import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

import { listMyOrders } from "@/api/orders";
import type { Paginated, PaginationQuery } from "@/types/api.types";
import type { Order } from "@/types/order.types";

export const MY_ORDERS_PAGE_SIZE = 10;

export function useMyOrders(
  query: MaybeRefOrGetter<PaginationQuery> = {}
): UseQueryReturnType<Paginated<Order>, Error> {
  const page = computed(() => toValue(query).page ?? 1);
  const limit = computed(() => toValue(query).limit ?? MY_ORDERS_PAGE_SIZE);

  return useQuery({
    queryKey: ["orders", "my", page, limit],
    queryFn: () => listMyOrders({ page: page.value, limit: limit.value }),
  });
}
