import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

import * as pizzasApi from "@/api/pizzas";
import { MENU_PAGE_SIZE, usePizza, usePizzas } from "@/composables/usePizzas";
import type { Paginated } from "@/types/api.types";
import type { Pizza, PizzaListQuery } from "@/types/pizza.types";

vi.mock("@/api/pizzas", () => ({ listPizzas: vi.fn(), getPizza: vi.fn() }));

const pageOf = (names: string[], page = 1): Paginated<Pizza> => ({
  data: names.map((name) => ({ id: name, name }) as Pizza),
  page,
  limit: MENU_PAGE_SIZE,
  total: names.length,
  totalPages: 1,
});

function withQuery<T>(
  composable: () => T,
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
): { result: T; queryClient: QueryClient } {
  let result!: T;
  mount(
    defineComponent({
      setup: () => {
        result = composable();
        return () => null;
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } }
  );
  return { result, queryClient };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("usePizzas", () => {
  it("fetches with default page and limit under the pizzas key", async () => {
    vi.mocked(pizzasApi.listPizzas).mockResolvedValue(pageOf(["Margherita"]));

    const { result, queryClient } = withQuery(() => usePizzas());
    await flushPromises();

    expect(pizzasApi.listPizzas).toHaveBeenCalledWith({
      page: 1,
      limit: MENU_PAGE_SIZE,
      search: "",
    });
    expect(result.data.value?.data.map((pizza) => pizza.name)).toEqual(["Margherita"]);
    expect(queryClient.getQueryData(["pizzas", 1, MENU_PAGE_SIZE, ""])).toBeDefined();
  });

  it("keeps the previous page while the next one loads", async () => {
    const query = ref<PizzaListQuery>({ page: 1 });
    vi.mocked(pizzasApi.listPizzas).mockResolvedValueOnce(pageOf(["Margherita"]));
    let resolveNext!: (value: Paginated<Pizza>) => void;
    vi.mocked(pizzasApi.listPizzas).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveNext = resolve;
      })
    );

    const { result } = withQuery(() => usePizzas(query));
    await flushPromises();
    query.value = { page: 2, search: " diavola " };
    await flushPromises();

    expect(pizzasApi.listPizzas).toHaveBeenLastCalledWith({
      page: 2,
      limit: MENU_PAGE_SIZE,
      search: "diavola",
    });
    expect(result.data.value?.data[0]?.name).toBe("Margherita");
    expect(result.isPlaceholderData.value).toBe(true);

    resolveNext(pageOf(["Diavola"], 2));
    await flushPromises();

    expect(result.data.value?.data[0]?.name).toBe("Diavola");
  });
});

describe("usePizza", () => {
  it("fetches one pizza under the pizzas/id key", async () => {
    vi.mocked(pizzasApi.getPizza).mockResolvedValue({ id: "p1", name: "Margherita" } as Pizza);

    const { result, queryClient } = withQuery(() => usePizza("p1"));
    await flushPromises();

    expect(pizzasApi.getPizza).toHaveBeenCalledWith("p1");
    expect(result.data.value?.name).toBe("Margherita");
    expect(queryClient.getQueryData(["pizzas", "p1"])).toBeDefined();
  });

  it("starts from a fresh list cache entry without refetching", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
    });
    queryClient.setQueryData(["pizzas", 1, MENU_PAGE_SIZE, ""], pageOf(["Margherita", "Diavola"]));

    const { result } = withQuery(() => usePizza("Diavola"), queryClient);
    await flushPromises();

    expect(result.data.value?.name).toBe("Diavola");
    expect(pizzasApi.getPizza).not.toHaveBeenCalled();
  });
});
