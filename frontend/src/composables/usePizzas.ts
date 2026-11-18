import {
  keepPreviousData,
  type QueryClient,
  useMutation,
  type UseMutationReturnType,
  useQuery,
  useQueryClient,
  type UseQueryReturnType,
} from "@tanstack/vue-query";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

import {
  createPizza,
  deletePizza,
  getPizza,
  listPizzas,
  updatePizza,
  uploadPizzaImage,
} from "@/services/api/pizzas";
import type { Paginated } from "@/types/pagination.types";
import type { Pizza, PizzaListQuery, PizzaPayload } from "@/types/pizza.types";
import { MENU_PAGE_SIZE } from "@/utils/constants/pizza.constants";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

export function usePizzas(
  query: MaybeRefOrGetter<PizzaListQuery> = {}
): UseQueryReturnType<Paginated<Pizza>, Error> {
  const page = computed(() => toValue(query).page ?? 1);
  const limit = computed(() => toValue(query).limit ?? MENU_PAGE_SIZE);
  const search = computed(() => toValue(query).search?.trim() ?? "");

  return useQuery({
    queryKey: QUERY_KEYS.pizzas.list(page, limit, search),
    queryFn: () => listPizzas({ page: page.value, limit: limit.value, search: search.value }),
    placeholderData: keepPreviousData,
  });
}

interface CachedPizza {
  pizza: Pizza;
  updatedAt: number;
}

function isPizzaPage(value: unknown): value is Paginated<Pizza> {
  return (
    typeof value === "object" && value !== null && Array.isArray((value as Paginated<Pizza>).data)
  );
}

function findPizzaInLists(queryClient: QueryClient, id: string): CachedPizza | undefined {
  for (const query of queryClient.getQueryCache().findAll({ queryKey: QUERY_KEYS.pizzas.all })) {
    const page: unknown = query.state.data;
    const pizza = isPizzaPage(page) ? page.data.find((item) => item.id === id) : undefined;
    if (pizza) {
      return { pizza, updatedAt: query.state.dataUpdatedAt };
    }
  }
  return undefined;
}

interface PizzaQueryOptions {
  enabled?: MaybeRefOrGetter<boolean>;
}

export function usePizza(
  id: MaybeRefOrGetter<string>,
  { enabled = true }: PizzaQueryOptions = {}
): UseQueryReturnType<Pizza, Error> {
  const queryClient = useQueryClient();
  const pizzaId = computed(() => toValue(id));

  return useQuery({
    queryKey: QUERY_KEYS.pizzas.detail(pizzaId),
    queryFn: () => getPizza(pizzaId.value),
    enabled: computed(() => toValue(enabled)),
    initialData: () => findPizzaInLists(queryClient, pizzaId.value)?.pizza,
    initialDataUpdatedAt: () => findPizzaInLists(queryClient, pizzaId.value)?.updatedAt,
  });
}

export function useDeletePizza(): UseMutationReturnType<void, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deletePizza(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.pizzas.detail(id) });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pizzas.all });
    },
  });
}

interface UpdatePizzaVariables {
  id: string;
  payload: PizzaPayload;
}

interface UploadPizzaImageVariables {
  id: string;
  image: File;
}

async function storeSavedPizza(queryClient: QueryClient, pizza: Pizza): Promise<void> {
  queryClient.setQueryData(QUERY_KEYS.pizzas.detail(pizza.id), pizza);
  await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pizzas.lists });
}

export function useCreatePizza(): UseMutationReturnType<Pizza, Error, PizzaPayload, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createPizza(payload),
    onSuccess: (pizza) => storeSavedPizza(queryClient, pizza),
  });
}

export function useUpdatePizza(): UseMutationReturnType<
  Pizza,
  Error,
  UpdatePizzaVariables,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updatePizza(id, payload),
    onSuccess: (pizza) => storeSavedPizza(queryClient, pizza),
  });
}

export function useUploadPizzaImage(): UseMutationReturnType<
  Pizza,
  Error,
  UploadPizzaImageVariables,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, image }) => uploadPizzaImage(id, image),
    onSuccess: (pizza) => storeSavedPizza(queryClient, pizza),
  });
}
