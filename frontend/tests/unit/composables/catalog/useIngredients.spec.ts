import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

import { useCreateIngredient, useIngredients } from "@/composables/catalog/useIngredients";
import * as ingredientsApi from "@/services/api/ingredients";
import type { Ingredient } from "@/types/pizza.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

vi.mock("@/services/api/ingredients", () => ({
  listIngredients: vi.fn(),
  createIngredient: vi.fn(),
}));

const BASIL = { id: "i1", name: "Basil" } as Ingredient;
const OREGANO = { id: "i2", name: "Oregano" } as Ingredient;

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

describe("useIngredients", () => {
  it("loads all ingredients under the ingredients key", async () => {
    vi.mocked(ingredientsApi.listIngredients).mockResolvedValue([BASIL]);
    const { result, queryClient } = withQuery(() => useIngredients());
    await flushPromises();

    expect(result.data.value).toEqual([BASIL]);
    expect(queryClient.getQueryData(QUERY_KEYS.ingredients)).toEqual([BASIL]);
  });
});

describe("useCreateIngredient", () => {
  it("creates the ingredient and adds it to the cached list", async () => {
    vi.mocked(ingredientsApi.createIngredient).mockResolvedValue(OREGANO);
    vi.mocked(ingredientsApi.listIngredients).mockReturnValue(new Promise(() => undefined));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(QUERY_KEYS.ingredients, [BASIL]);
    const { result } = withQuery(() => useCreateIngredient(), queryClient);

    await expect(result.mutateAsync("Oregano")).resolves.toEqual(OREGANO);

    expect(ingredientsApi.createIngredient).toHaveBeenCalledWith("Oregano");
    expect(queryClient.getQueryData(QUERY_KEYS.ingredients)).toEqual([BASIL, OREGANO]);
  });
});
