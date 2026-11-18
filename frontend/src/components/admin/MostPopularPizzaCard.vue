<script setup lang="ts">
import Skeleton from "primevue/skeleton";
import { computed } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import type { MostOrderedPizza } from "@/types/analytics.types";

interface MostPopularPizzaCardProps {
  pizza?: MostOrderedPizza | null;
  periodLabel: string;
  loading?: boolean;
  error?: boolean;
}

interface MostPopularPizzaCardEmits {
  retry: [];
}

const { pizza = null, periodLabel, loading, error } = defineProps<MostPopularPizzaCardProps>();
const emit = defineEmits<MostPopularPizzaCardEmits>();

const ordersLabel = computed(() => {
  const count = pizza?.orderCount ?? 0;
  return `${String(count)} ${count === 1 ? "order" : "orders"} in ${periodLabel}`;
});
</script>

<template>
  <section
    class="flex flex-col gap-4 rounded-card border border-primary/20 bg-primary/5 p-6 text-card-foreground shadow-card"
    data-test="popular-pizza-card"
  >
    <header class="flex items-center gap-3">
      <span
        class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <i class="pi pi-trophy" />
      </span>
      <h2 class="text-section-title">Most popular pizza</h2>
    </header>

    <div v-if="loading" class="flex flex-col gap-2" data-test="popular-pizza-skeleton">
      <Skeleton width="12rem" height="2.25rem" />
      <Skeleton width="8rem" height="1rem" />
    </div>

    <BaseEmptyState
      v-else-if="error"
      icon="pi pi-exclamation-circle"
      title="Couldn't load the most popular pizza"
    >
      <template #actions>
        <BaseButton variant="secondary" size="sm" label="Try again" @click="emit('retry')" />
      </template>
    </BaseEmptyState>

    <BaseEmptyState
      v-else-if="!pizza"
      icon="pi pi-chart-bar"
      title="No orders yet"
      :description="`Nothing was ordered in ${periodLabel}.`"
    />

    <div v-else class="flex flex-col gap-1">
      <span class="font-display text-3xl font-bold text-foreground" data-test="popular-pizza-name">
        {{ pizza.pizzaName }}
      </span>
      <span class="text-sm text-muted-foreground" data-test="popular-pizza-orders">
        {{ ordersLabel }}
      </span>
    </div>
  </section>
</template>
