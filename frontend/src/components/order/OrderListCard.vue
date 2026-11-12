<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

import type { Order } from "@/types/order.types";
import { formatOrderDateTime, formatPrice, shortId } from "@/utils/format";
import { summarizeOrderItems } from "@/utils/order-items-summary";

import OrderItemTile from "./OrderItemTile.vue";
import OrderStatusBadge from "./OrderStatusBadge.vue";

interface OrderListCardProps {
  order: Order;
}

const { order } = defineProps<OrderListCardProps>();

const itemsSummary = computed(() => summarizeOrderItems(order.orderItems));
</script>

<template>
  <RouterLink
    :to="{ name: 'my-order-details', params: { id: order.id } }"
    class="flex flex-col gap-3 rounded-card border border-border bg-card p-5 text-card-foreground shadow-card transition hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    :aria-label="`Order ${shortId(order.id)}`"
  >
    <div class="flex items-center gap-3">
      <span class="font-display font-semibold" data-test="order-number">
        {{ shortId(order.id) }}
      </span>
      <OrderStatusBadge :status="order.status" />
      <span class="ml-auto font-display text-lg font-semibold" data-test="order-total">
        {{ formatPrice(order.finalPrice) }}
      </span>
      <i class="pi pi-chevron-right text-xs text-muted-foreground" aria-hidden="true" />
    </div>
    <time :datetime="order.createdAt" class="text-sm text-muted-foreground">
      {{ formatOrderDateTime(order.createdAt) }}
    </time>
    <div class="flex min-w-0 items-center gap-3">
      <OrderItemTile size="sm" />
      <span class="min-w-0 truncate text-sm" :title="itemsSummary" data-test="order-items">
        {{ itemsSummary }}
      </span>
    </div>
  </RouterLink>
</template>
