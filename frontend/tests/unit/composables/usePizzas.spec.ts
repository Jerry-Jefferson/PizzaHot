import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

import {
  useCreatePizza,
  useDeletePizza,
  usePizza,
  usePizzas,
  useUpdatePizza,
  useUploadPizzaImage,
} from "@/composables/usePizzas";
import * as pizzasApi from "@/services/api/pizzas";
import type { Paginated } from "@/types/pagination.types";
import type { Pizza, PizzaListQuery } from "@/types/pizza.types";
import { MENU_PAGE_SIZE } from "@/utils/constants/pizza.constants";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

vi.mock("@/services/api/pizzas", () => ({
  listPizzas: vi.fn(),
  getPizza: vi.fn(),
  deletePizza: vi.fn(),
  createPizza: vi.fn(),
  updatePizza: vi.fn(),
  uploadPizzaImage: vi.fn(),
}));

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
    expect(queryClient.getQueryData(QUERY_KEYS.pizzas.list(1, MENU_PAGE_SIZE, ""))).toBeDefined();
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
    expect(queryClient.getQueryData(QUERY_KEYS.pizzas.detail("p1"))).toBeDefined();
  });

  it("starts from a fresh list cache entry without refetching", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
    });
    queryClient.setQueryData(
      QUERY_KEYS.pizzas.list(1, MENU_PAGE_SIZE, ""),
      pageOf(["Margherita", "Diavola"])
    );

    const { result } = withQuery(() => usePizza("Diavola"), queryClient);
    await flushPromises();

    expect(result.data.value?.name).toBe("Diavola");
    expect(pizzasApi.getPizza).not.toHaveBeenCalled();
  });
});

describe("usePizza when disabled", () => {
  it("does not fetch until it is enabled", async () => {
    const enabled = ref(false);
    vi.mocked(pizzasApi.getPizza).mockResolvedValue({ id: "p1" } as Pizza);
    withQuery(() => usePizza("p1", { enabled }));
    await flushPromises();
    expect(pizzasApi.getPizza).not.toHaveBeenCalled();

    enabled.value = true;
    await flushPromises();

    expect(pizzasApi.getPizza).toHaveBeenCalledWith("p1");
  });
});

describe("useDeletePizza", () => {
  it("deletes the pizza, drops its details and marks pizza lists stale", async () => {
    vi.mocked(pizzasApi.deletePizza).mockResolvedValue();
    const { result, queryClient } = withQuery(() => useDeletePizza());
    queryClient.setQueryData(QUERY_KEYS.pizzas.detail("p1"), { id: "p1" } as Pizza);
    queryClient.setQueryData(QUERY_KEYS.pizzas.list(1, 10, ""), { data: [] });

    await result.mutateAsync("p1");
    await flushPromises();

    expect(pizzasApi.deletePizza).toHaveBeenCalledWith("p1");
    expect(queryClient.getQueryData(QUERY_KEYS.pizzas.detail("p1"))).toBeUndefined();
    expect(queryClient.getQueryState(QUERY_KEYS.pizzas.list(1, 10, ""))?.isInvalidated).toBe(true);
  });

  it("keeps the cache when the delete fails", async () => {
    const error = new Error("Server error");
    vi.mocked(pizzasApi.deletePizza).mockRejectedValue(error);
    const { result, queryClient } = withQuery(() => useDeletePizza());
    queryClient.setQueryData(QUERY_KEYS.pizzas.detail("p1"), { id: "p1" } as Pizza);

    await expect(result.mutateAsync("p1")).rejects.toBe(error);
    expect(queryClient.getQueryData(QUERY_KEYS.pizzas.detail("p1"))).toEqual({ id: "p1" });
  });
});

describe("pizza save mutations", () => {
  const SAVED = { id: "p9", name: "Diavola", price: 12.5 } as Pizza;
  const PAYLOAD = { name: "Diavola", description: "Spicy", price: 12.5, ingredientIds: ["i1"] };

  function seedList(queryClient: QueryClient): void {
    queryClient.setQueryData(QUERY_KEYS.pizzas.list(1, 10, ""), pageOf(["Margherita"]));
  }

  it("creates a pizza, caches its details and marks lists stale", async () => {
    vi.mocked(pizzasApi.createPizza).mockResolvedValue(SAVED);
    const { result, queryClient } = withQuery(() => useCreatePizza());
    seedList(queryClient);

    await expect(result.mutateAsync(PAYLOAD)).resolves.toEqual(SAVED);
    await flushPromises();

    expect(pizzasApi.createPizza).toHaveBeenCalledWith(PAYLOAD);
    expect(queryClient.getQueryData(QUERY_KEYS.pizzas.detail("p9"))).toEqual(SAVED);
    expect(queryClient.getQueryState(QUERY_KEYS.pizzas.list(1, 10, ""))?.isInvalidated).toBe(true);
  });

  it("updates a pizza with the full payload", async () => {
    vi.mocked(pizzasApi.updatePizza).mockResolvedValue(SAVED);
    const { result, queryClient } = withQuery(() => useUpdatePizza());

    await result.mutateAsync({ id: "p9", payload: PAYLOAD });

    expect(pizzasApi.updatePizza).toHaveBeenCalledWith("p9", PAYLOAD);
    expect(queryClient.getQueryData(QUERY_KEYS.pizzas.detail("p9"))).toEqual(SAVED);
  });

  it("uploads an image and caches the returned pizza", async () => {
    const withImage = { ...SAVED, image: "/uploads/pizzas/p9.png" };
    vi.mocked(pizzasApi.uploadPizzaImage).mockResolvedValue(withImage);
    const image = new File(["png"], "diavola.png", { type: "image/png" });
    const { result, queryClient } = withQuery(() => useUploadPizzaImage());

    await result.mutateAsync({ id: "p9", image });

    expect(pizzasApi.uploadPizzaImage).toHaveBeenCalledWith("p9", image);
    expect(queryClient.getQueryData(QUERY_KEYS.pizzas.detail("p9"))).toEqual(withImage);
  });
});
