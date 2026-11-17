import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";

import { listIngredients } from "@/services/api/ingredients";
import type { Ingredient } from "@/types/pizza.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

export function useIngredients(): UseQueryReturnType<Ingredient[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.ingredients,
    queryFn: () => listIngredients(),
  });
}
