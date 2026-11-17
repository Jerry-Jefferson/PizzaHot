import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

import { useIngredients } from "@/composables/useIngredients";
import * as ingredientsApi from "@/services/api/ingredients";
import type { Ingredient } from "@/types/pizza.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

vi.mock("@/services/api/ingredients", () => ({ listIngredients: vi.fn() }));

const BASIL = { id: "i1", name: "Basil" } as Ingredient;

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useIngredients", () => {
  it("loads all ingredients under the ingredients key", async () => {
    vi.mocked(ingredientsApi.listIngredients).mockResolvedValue([BASIL]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let result!: ReturnType<typeof useIngredients>;
    mount(
      defineComponent({
        setup: () => {
          result = useIngredients();
          return () => null;
        },
      }),
      { global: { plugins: [[VueQueryPlugin, { queryClient }]] } }
    );
    await flushPromises();

    expect(result.data.value).toEqual([BASIL]);
    expect(queryClient.getQueryData(QUERY_KEYS.ingredients)).toEqual([BASIL]);
  });
});
