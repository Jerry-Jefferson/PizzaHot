<script setup lang="ts">
import Skeleton from "primevue/skeleton";
import { RouterLink } from "vue-router";

import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import OrderStatusBadge from "@/components/order/OrderStatusBadge.vue";
import type { Order } from "@/types/order.types";
import type { User } from "@/types/user.types";
import { RECENT_ORDERS_LIMIT } from "@/utils/constants/order.constants";
import { ROUTES } from "@/utils/constants/routes.constants";
import { formatPrice, shortId } from "@/utils/format";
import { getCustomerLabel } from "@/utils/user";

interface RecentOrdersCardProps {
  orders: Order[];
  customers: Map<string, User | null>;
  loading?: boolean;
  error?: boolean;
}

interface RecentOrdersCardEmits {
  retry: [];
}

const { orders, customers, loading, error } = defineProps<RecentOrdersCardProps>();
const emit = defineEmits<RecentOrdersCardEmits>();

function customerOf(order: Order): User | null | undefined {
  return order.userId === null ? undefined : customers.get(order.userId);
}
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-section-title">Recent orders</h2>
        <RouterLink
          :to="{ name: ROUTES.ADMIN_ORDERS.NAME }"
          class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          data-test="view-all-orders"
        >
          View all <i class="pi pi-angle-right text-xs" aria-hidden="true" />
        </RouterLink>
      </div>
    </template>

    <div v-if="loading" class="flex flex-col gap-3" aria-hidden="true" data-test="recent-skeleton">
      <Skeleton v-for="index in RECENT_ORDERS_LIMIT" :key="index" height="3rem" />
    </div>

    <BaseEmptyState
      v-else-if="error"
      icon="pi pi-exclamation-circle"
      title="Couldn't load recent orders"
    >
      <template #actions>
        <BaseButton variant="secondary" size="sm" label="Try again" @click="emit('retry')" />
      </template>
    </BaseEmptyState>

    <BaseEmptyState
      v-else-if="orders.length === 0"
      icon="pi pi-receipt"
      title="No orders yet"
      description="New orders will show up here."
    />

    <ul v-else class="flex flex-col divide-y divide-border">
      <li
        v-for="order in orders"
        :key="order.id"
        class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        data-test="recent-order"
      >
        <BaseAvatar
          :name="customerOf(order)?.name"
          :surname="customerOf(order)?.surname"
          :email="customerOf(order)?.email"
          size="sm"
        />
        <div class="flex min-w-0 flex-1 flex-col">
          <span
            v-if="getCustomerLabel(order.userId, customerOf(order)) !== undefined"
            class="truncate text-sm font-medium text-foreground"
            data-test="customer-name"
          >
            {{ getCustomerLabel(order.userId, customerOf(order)) }}
          </span>
          <Skeleton v-else width="8rem" height="1rem" data-test="customer-skeleton" />
          <span class="font-mono text-xs text-muted-foreground">{{ shortId(order.id) }}</span>
        </div>
        <span class="text-sm font-semibold text-foreground">
          {{ formatPrice(order.finalPrice) }}
        </span>
        <OrderStatusBadge :status="order.status" />
      </li>
    </ul>
  </BaseCard>
</template>
