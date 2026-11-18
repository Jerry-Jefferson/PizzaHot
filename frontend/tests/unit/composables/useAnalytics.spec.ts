import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

import { useHighestChecks, usePopularPizza } from "@/composables/useAnalytics";
import * as analyticsApi from "@/services/api/analytics";

vi.mock("@/services/api/analytics", () => ({
  getPopularPizza: vi.fn(),
  getHighestChecks: vi.fn(),
}));

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
});

describe("usePopularPizza", () => {
  it("loads the most ordered pizza for the given month and year", async () => {
    const popular = { pizzaName: "Diavola", orderCount: 7 };
    vi.mocked(analyticsApi.getPopularPizza).mockResolvedValue(popular);

    const { data } = withQuery(() => usePopularPizza(3, 2026));
    await flushPromises();

    expect(analyticsApi.getPopularPizza).toHaveBeenCalledWith(3, 2026);
    expect(data.value).toEqual(popular);
  });

  it("keeps null when the month has no orders", async () => {
    vi.mocked(analyticsApi.getPopularPizza).mockResolvedValue(null);

    const { data } = withQuery(() => usePopularPizza(3, 2026));
    await flushPromises();

    expect(data.value).toBeNull();
  });
});

describe("useHighestChecks", () => {
  it("loads the customers above the average check", async () => {
    const customers = [
      {
        userId: "u1",
        email: "ada@example.com",
        name: "Ada",
        orderCount: 5,
        averageCheck: 42,
        globalAverageCheck: 30,
      },
    ];
    vi.mocked(analyticsApi.getHighestChecks).mockResolvedValue(customers);

    const { data } = withQuery(() => useHighestChecks());
    await flushPromises();

    expect(analyticsApi.getHighestChecks).toHaveBeenCalledTimes(1);
    expect(data.value).toEqual(customers);
  });
});
