<script setup lang="ts">
import BaseCard from "@/components/base/BaseCard.vue";
import type { Order } from "@/types/order.types";
import { formatPrice } from "@/utils/format";

import OrderItemTile from "./OrderItemTile.vue";

interface OrderItemsCardProps {
  order: Pick<
    Order,
    "orderItems" | "totalPrice" | "discountAmount" | "finalPrice" | "codeApplied"
  >;
}

const { order } = defineProps<OrderItemsCardProps>();
</script>

<template>
  <BaseCard>
    <h2 class="text-section-title">Items ordered</h2>
    <ul class="flex flex-col gap-4">
      <li
        v-for="item in order.orderItems"
        :key="item.id"
        class="flex items-center gap-4"
        data-test="order-item"
      >
        <OrderItemTile />
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="truncate text-label">{{ item.pizzaName }}</span>
          <span class="text-caption">
            Qty {{ item.quantity }} · {{ formatPrice(item.priceAtPurchase) }} each
          </span>
        </div>
        <span class="shrink-0 font-semibold">{{ formatPrice(item.subtotal) }}</span>
      </li>
    </ul>
    <dl class="flex flex-col gap-3 border-t border-border pt-4 text-sm">
      <div class="flex justify-between">
        <dt class="text-muted-foreground">Subtotal</dt>
        <dd data-test="order-subtotal">{{ formatPrice(order.totalPrice) }}</dd>
      </div>
      <div
        v-if="(order.discountAmount ?? 0) > 0"
        class="flex justify-between"
        data-test="order-discount"
      >
        <dt class="text-muted-foreground">
          Discount<template v-if="order.codeApplied"> ({{ order.codeApplied }})</template>
        </dt>
        <dd class="text-status-success-fg">−{{ formatPrice(order.discountAmount ?? 0) }}</dd>
      </div>
      <div class="flex items-baseline justify-between border-t border-border pt-3">
        <dt class="font-semibold">Total</dt>
        <dd class="font-display text-2xl font-bold" data-test="order-final-total">
          {{ formatPrice(order.finalPrice) }}
        </dd>
      </div>
    </dl>
  </BaseCard>
</template>
