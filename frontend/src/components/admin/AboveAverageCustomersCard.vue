<script setup lang="ts">
import Skeleton from "primevue/skeleton";
import { computed } from "vue";

import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import type { UserAboveAverageCheck } from "@/types/analytics.types";
import { UNKNOWN_USER_LABEL } from "@/utils/constants/user.constants";
import { formatPrice } from "@/utils/format";

interface AboveAverageCustomersCardProps {
  customers: UserAboveAverageCheck[];
  loading?: boolean;
  error?: boolean;
}

interface AboveAverageCustomersCardEmits {
  retry: [];
}

const SKELETON_ROWS = 4;

const { customers, loading, error } = defineProps<AboveAverageCustomersCardProps>();
const emit = defineEmits<AboveAverageCustomersCardEmits>();

const globalAverage = computed(() => customers[0]?.globalAverageCheck);
const highestAverage = computed(() =>
  Math.max(0, ...customers.map((customer) => customer.averageCheck))
);

function displayName(customer: UserAboveAverageCheck): string {
  const name = customer.name?.trim();
  if (name) {
    return name;
  }
  return customer.email === "" ? UNKNOWN_USER_LABEL : customer.email;
}

function ordersLabel(count: number): string {
  return `${String(count)} ${count === 1 ? "order" : "orders"}`;
}

function barWidth(customer: UserAboveAverageCheck): string {
  const ratio = highestAverage.value > 0 ? customer.averageCheck / highestAverage.value : 0;
  return `${String(Math.round(ratio * 100))}%`;
}
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="flex flex-col gap-1">
        <h2 class="text-section-title">Customers above average check</h2>
        <p class="text-caption" data-test="global-average">
          All time<template v-if="globalAverage !== undefined">
            · Global average {{ formatPrice(globalAverage) }}</template
          >
        </p>
      </div>
    </template>

    <div
      v-if="loading"
      class="flex flex-col gap-3"
      aria-hidden="true"
      data-test="customers-skeleton"
    >
      <Skeleton v-for="index in SKELETON_ROWS" :key="index" height="3rem" />
    </div>

    <BaseEmptyState
      v-else-if="error"
      icon="pi pi-exclamation-circle"
      title="Couldn't load customers"
    >
      <template #actions>
        <BaseButton variant="secondary" size="sm" label="Try again" @click="emit('retry')" />
      </template>
    </BaseEmptyState>

    <BaseEmptyState
      v-else-if="customers.length === 0"
      icon="pi pi-users"
      title="No customers above average yet"
      description="Customers show up here after more than three orders above the average check."
    />

    <ul v-else class="flex flex-col divide-y divide-border">
      <li
        v-for="customer in customers"
        :key="customer.userId"
        class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        data-test="above-average-customer"
      >
        <BaseAvatar :name="customer.name" :email="customer.email" size="sm" />
        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <div class="flex items-baseline justify-between gap-3">
            <span class="truncate text-sm font-medium text-foreground" data-test="customer-name">
              {{ displayName(customer) }}
            </span>
            <span class="shrink-0 text-sm font-semibold" data-test="customer-average">
              {{ formatPrice(customer.averageCheck) }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
              <div
                class="h-full rounded-full bg-primary"
                :style="{ width: barWidth(customer) }"
                data-test="customer-bar"
              />
            </div>
            <span class="shrink-0 text-caption" data-test="customer-orders">
              {{ ordersLabel(customer.orderCount) }}
            </span>
          </div>
        </div>
      </li>
    </ul>
  </BaseCard>
</template>
