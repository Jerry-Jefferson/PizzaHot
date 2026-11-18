import { computed, type ComputedRef, type WritableComputedRef } from "vue";
import { type LocationQueryRaw, useRoute, useRouter } from "vue-router";

import type {
  DeliveryType,
  OrderFilterValues,
  OrderSearchQuery,
  OrderStatus,
  PaymentMethod,
} from "@/types/order.types";
import {
  ADMIN_ORDERS_PAGE_SIZE,
  DELIVERY_TYPES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
} from "@/utils/constants/order.constants";
import { logError } from "@/utils/logger";
import { parseEnumQuery, parsePageQuery } from "@/utils/route-query";

const FILTER_QUERY_KEYS: Record<keyof OrderFilterValues, string> = {
  status: "status",
  delivery: "delivery",
  paymentMethod: "payment",
};

interface OrderFilters {
  status: WritableComputedRef<OrderStatus | "">;
  delivery: WritableComputedRef<DeliveryType | "">;
  paymentMethod: WritableComputedRef<PaymentMethod | "">;
  page: WritableComputedRef<number>;
  hasFilters: ComputedRef<boolean>;
  searchQuery: ComputedRef<OrderSearchQuery>;
  clearFilters: () => void;
}

export function useOrderFilters(): OrderFilters {
  const route = useRoute();
  const router = useRouter();

  function replaceQuery(query: LocationQueryRaw): void {
    router.replace({ query }).catch(logError("Order filters navigation"));
  }

  function filterRef<TKey extends keyof OrderFilterValues>(
    key: TKey,
    allowed: readonly Exclude<OrderFilterValues[TKey], "">[]
  ): WritableComputedRef<OrderFilterValues[TKey]> {
    const queryKey = FILTER_QUERY_KEYS[key];
    return computed({
      get: () => parseEnumQuery(route.query[queryKey], allowed) as OrderFilterValues[TKey],
      set: (value) => {
        replaceQuery({ ...route.query, [queryKey]: value || undefined, page: undefined });
      },
    });
  }

  const status = filterRef("status", ORDER_STATUSES);
  const delivery = filterRef("delivery", DELIVERY_TYPES);
  const paymentMethod = filterRef("paymentMethod", PAYMENT_METHODS);

  const page = computed({
    get: () => parsePageQuery(route.query.page),
    set: (value: number) => {
      router
        .push({ query: { ...route.query, page: value > 1 ? String(value) : undefined } })
        .catch(logError("Orders page navigation"));
    },
  });

  const hasFilters = computed(
    () => status.value !== "" || delivery.value !== "" || paymentMethod.value !== ""
  );

  const searchQuery = computed<OrderSearchQuery>(() => ({
    page: page.value,
    limit: ADMIN_ORDERS_PAGE_SIZE,
    ...(status.value && { status: status.value }),
    ...(delivery.value && { delivery: delivery.value }),
    ...(paymentMethod.value && { paymentMethod: paymentMethod.value }),
  }));

  function clearFilters(): void {
    const query: LocationQueryRaw = { ...route.query, page: undefined };
    Object.values(FILTER_QUERY_KEYS).forEach((queryKey) => {
      query[queryKey] = undefined;
    });
    replaceQuery(query);
  }

  return { status, delivery, paymentMethod, page, hasFilters, searchQuery, clearFilters };
}
