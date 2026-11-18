<script setup lang="ts">
import DatePicker from "primevue/datepicker";
import { computed } from "vue";

import AboveAverageCustomersCard from "@/components/admin/AboveAverageCustomersCard.vue";
import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";
import MostPopularPizzaCard from "@/components/admin/MostPopularPizzaCard.vue";
import { useHighestChecks, usePopularPizza } from "@/composables/analytics/useAnalytics";
import { useAnalyticsMonth } from "@/composables/analytics/useAnalyticsMonth";
import { formatMonthYear } from "@/utils/format";
import { startOfMonth } from "@/utils/route-query";

const { month, monthNumber, year, latestMonth } = useAnalyticsMonth();

const popularPizza = usePopularPizza(monthNumber, year);
const highestChecks = useHighestChecks();

const periodLabel = computed(() => formatMonthYear(month.value));
const customers = computed(() => highestChecks.data.value ?? []);

function selectMonth(value: Date | Date[] | (Date | null)[] | null | undefined): void {
  if (value instanceof Date) {
    month.value = startOfMonth(value);
  }
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <AdminPageHeader title="Analytics" subtitle="Monthly performance overview">
      <template #actions>
        <DatePicker
          :model-value="month"
          view="month"
          date-format="MM yy"
          :max-date="latestMonth"
          show-icon
          icon-display="input"
          input-id="analytics-month"
          aria-label="Choose month"
          class="w-48"
          data-test="analytics-month"
          @update:model-value="selectMonth"
        />
      </template>
    </AdminPageHeader>

    <div class="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
      <MostPopularPizzaCard
        :pizza="popularPizza.data.value"
        :period-label="periodLabel"
        :loading="popularPizza.isPending.value && !popularPizza.isError.value"
        :error="popularPizza.isError.value"
        @retry="popularPizza.refetch()"
      />
      <AboveAverageCustomersCard
        :customers="customers"
        :loading="highestChecks.isPending.value && !highestChecks.isError.value"
        :error="highestChecks.isError.value"
        @retry="highestChecks.refetch()"
      />
    </div>
  </section>
</template>
