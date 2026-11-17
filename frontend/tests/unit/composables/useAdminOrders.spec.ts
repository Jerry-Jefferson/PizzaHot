import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

import { useOrderSearch, usePendingOrdersCount } from "@/composables/useAdminOrders";
import * as ordersApi from "@/services/api/orders";
import type { Order, OrderSearchQuery } from "@/types/order.types";
import type { Paginated } from "@/types/pagination.types";
import { PENDING_ORDERS_REFETCH_MS } from "@/utils/constants/order.constants";

vi.mock("@/services/api/orders", () => ({ searchOrders: vi.fn() }));

const pageWithTotal = (total: number): Paginated<Order> => ({
  data: [],
  page: 1,
  limit: 1,
  total,
  totalPages: total,
});

function withQuery<T>(composable: () => T): T {
  let result!: T;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mount(
    defineComponent({
      setup: () => {
        result = composable();
        return () => null;
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } }
  );
  return result;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(ordersApi.searchOrders).mockResolvedValue(pageWithTotal(0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useOrderSearch", () => {
  it("sends the filters as the search body", async () => {
    const page = pageWithTotal(3);
    vi.mocked(ordersApi.searchOrders).mockResolvedValue(page);

    const { data } = withQuery(() => useOrderSearch({ status: "confirmed", limit: 5 }));
    await flushPromises();

    expect(ordersApi.searchOrders).toHaveBeenCalledWith({ status: "confirmed", limit: 5 });
    expect(data.value).toEqual(page);
  });

  it("searches again when the filters change", async () => {
    const query = ref<OrderSearchQuery>({ page: 1 });
    withQuery(() => useOrderSearch(query));
    await flushPromises();

    query.value = { page: 2 };
    await flushPromises();

    expect(ordersApi.searchOrders).toHaveBeenLastCalledWith({ page: 2 });
  });
});

describe("usePendingOrdersCount", () => {
  it("counts pending orders from a one-item search", async () => {
    vi.mocked(ordersApi.searchOrders).mockResolvedValue(pageWithTotal(4));

    const { data } = withQuery(() => usePendingOrdersCount());
    await flushPromises();

    expect(ordersApi.searchOrders).toHaveBeenCalledWith({ status: "pending", limit: 1 });
    expect(data.value).toBe(4);
  });

  it("refreshes the count every minute", async () => {
    vi.useFakeTimers();
    withQuery(() => usePendingOrdersCount());
    await flushPromises();
    expect(ordersApi.searchOrders).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(PENDING_ORDERS_REFETCH_MS);

    expect(ordersApi.searchOrders).toHaveBeenCalledTimes(2);
  });
});
