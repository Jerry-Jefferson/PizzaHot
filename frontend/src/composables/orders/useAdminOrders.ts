import {
  type InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  type UseInfiniteQueryReturnType,
  useMutation,
  type UseMutationReturnType,
  useQuery,
  useQueryClient,
  type UseQueryReturnType,
} from "@tanstack/vue-query";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

import { getOrdersByUser, searchOrders, updateOrderStatus } from "@/services/api/orders";
import { type Order, type OrderSearchQuery, OrderStatus } from "@/types/order.types";
import type { Paginated } from "@/types/pagination.types";
import {
  CUSTOMER_ORDERS_PAGE_SIZE,
  PENDING_ORDERS_REFETCH_MS,
} from "@/utils/constants/order.constants";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

const PENDING_COUNT_QUERY: OrderSearchQuery = { status: OrderStatus.PENDING, limit: 1 };

export function useOrderSearch(
  query: MaybeRefOrGetter<OrderSearchQuery> = {}
): UseQueryReturnType<Paginated<Order>, Error> {
  const searchQuery = computed(() => toValue(query));

  return useQuery({
    queryKey: QUERY_KEYS.orders.search(searchQuery),
    queryFn: () => searchOrders(searchQuery.value),
    placeholderData: keepPreviousData,
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

interface UpdateOrderStatusVariables {
  id: string;
  status: OrderStatus;
}

export function useUpdateOrderStatus(): UseMutationReturnType<
  Order,
  Error,
  UpdateOrderStatusVariables,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all }),
  });
}

export function useCustomerOrders(
  userId: MaybeRefOrGetter<string | null>
): UseInfiniteQueryReturnType<InfiniteData<Paginated<Order>, number>, Error> {
  const customerId = computed(() => toValue(userId));

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.orders.byUser(computed(() => customerId.value ?? "")),
    queryFn: ({ pageParam }) =>
      getOrdersByUser(customerId.value ?? "", {
        page: pageParam,
        limit: CUSTOMER_ORDERS_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: computed(() => customerId.value !== null),
  });
}
