import { computed, type ComputedRef, type WritableComputedRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { logError } from "@/utils/logger";
import { parseMonthQuery, startOfMonth, toMonthQuery } from "@/utils/route-query";

interface AnalyticsMonth {
  month: WritableComputedRef<Date>;
  monthNumber: ComputedRef<number>;
  year: ComputedRef<number>;
  latestMonth: ComputedRef<Date>;
}

export function useAnalyticsMonth(): AnalyticsMonth {
  const route = useRoute();
  const router = useRouter();

  const latestMonth = computed(() => startOfMonth(new Date()));

  const month = computed({
    get: () => parseMonthQuery(route.query.month),
    set: (value: Date) => {
      const query = toMonthQuery(value);
      router
        .replace({
          query: {
            ...route.query,
            month: query === toMonthQuery(latestMonth.value) ? undefined : query,
          },
        })
        .catch(logError("Analytics month navigation"));
    },
  });

  return {
    month,
    monthNumber: computed(() => month.value.getMonth() + 1),
    year: computed(() => month.value.getFullYear()),
    latestMonth,
  };
}
