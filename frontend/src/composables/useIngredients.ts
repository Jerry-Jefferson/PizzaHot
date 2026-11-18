import {
  useMutation,
  type UseMutationReturnType,
  useQuery,
  useQueryClient,
  type UseQueryReturnType,
} from "@tanstack/vue-query";

import { createIngredient, listIngredients } from "@/services/api/ingredients";
import type { Ingredient } from "@/types/pizza.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

export function useIngredients(): UseQueryReturnType<Ingredient[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.ingredients,
    queryFn: () => listIngredients(),
  });
}

export function useCreateIngredient(): UseMutationReturnType<Ingredient, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => createIngredient(name),
    onSuccess: async (ingredient) => {
      queryClient.setQueryData<Ingredient[]>(QUERY_KEYS.ingredients, (ingredients = []) => [
        ...ingredients,
        ingredient,
      ]);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredients });
    },
  });
}
