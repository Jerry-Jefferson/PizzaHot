import { useQuery, type UseQueryReturnType } from "@tanstack/vue-query";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

import { getPopularPizza } from "@/services/api/analytics";
import type { MostOrderedPizza } from "@/types/analytics.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

export function usePopularPizza(
  month: MaybeRefOrGetter<number>,
  year: MaybeRefOrGetter<number>
): UseQueryReturnType<MostOrderedPizza | null, Error> {
  const monthValue = computed(() => toValue(month));
  const yearValue = computed(() => toValue(year));

  return useQuery({
    queryKey: QUERY_KEYS.analytics.popularPizza(monthValue, yearValue),
    queryFn: () => getPopularPizza(monthValue.value, yearValue.value),
  });
}
