import {
  keepPreviousData,
  type QueryClient,
  useQuery,
  useQueryClient,
  type UseQueryReturnType,
} from "@tanstack/vue-query";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

import { getPizza, listPizzas } from "@/api/pizzas";
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

interface CachedPizza {
  pizza: Pizza;
  updatedAt: number;
}

function isPizzaPage(value: unknown): value is Paginated<Pizza> {
  return typeof value === "object" && value !== null && Array.isArray((value as Paginated<Pizza>).data);
}

function findPizzaInLists(queryClient: QueryClient, id: string): CachedPizza | undefined {
  for (const query of queryClient.getQueryCache().findAll({ queryKey: ["pizzas"] })) {
    const page: unknown = query.state.data;
    const pizza = isPizzaPage(page) ? page.data.find((item) => item.id === id) : undefined;
    if (pizza) {
      return { pizza, updatedAt: query.state.dataUpdatedAt };
    }
  }
  return undefined;
}

export function usePizza(id: MaybeRefOrGetter<string>): UseQueryReturnType<Pizza, Error> {
  const queryClient = useQueryClient();
  const pizzaId = computed(() => toValue(id));

  return useQuery({
    queryKey: ["pizzas", pizzaId],
    queryFn: () => getPizza(pizzaId.value),
    initialData: () => findPizzaInLists(queryClient, pizzaId.value)?.pizza,
    initialDataUpdatedAt: () => findPizzaInLists(queryClient, pizzaId.value)?.updatedAt,
  });
}
