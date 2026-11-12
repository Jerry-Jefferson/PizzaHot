import { keepPreviousData, useQuery, type UseQueryReturnType } from "@tanstack/vue-query";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

import { listPizzas } from "@/api/pizzas";
import type { Paginated } from "@/types/api.types";
import type { Pizza, PizzaListQuery } from "@/types/pizza.types";

export const MENU_PAGE_SIZE = 9;

export function usePizzas(
  query: MaybeRefOrGetter<PizzaListQuery> = {}
): UseQueryReturnType<Paginated<Pizza>, Error> {
  const page = computed(() => toValue(query).page ?? 1);
  const limit = computed(() => toValue(query).limit ?? MENU_PAGE_SIZE);
  const search = computed(() => toValue(query).search?.trim() ?? "");

  return useQuery({
    queryKey: ["pizzas", page, limit, search],
    queryFn: () => listPizzas({ page: page.value, limit: limit.value, search: search.value }),
    placeholderData: keepPreviousData,
  });
}
