<script setup lang="ts">
import BaseCard from "@/components/base/BaseCard.vue";
import { formatPrice } from "@/utils/format";

interface OrderSummaryCardProps {
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  promoCode?: string | null;
}

const { totalPrice, discountAmount, finalPrice, promoCode = null } =
  defineProps<OrderSummaryCardProps>();

defineSlots<{
  default?: () => unknown;
  actions?: () => unknown;
}>();
</script>

<template>
  <BaseCard>
    <h2 class="text-section-title">Order Summary</h2>
    <slot />
    <dl class="flex flex-col gap-3 text-sm">
      <div class="flex justify-between">
        <dt class="text-muted-foreground">Subtotal</dt>
        <dd data-test="summary-subtotal">{{ formatPrice(totalPrice) }}</dd>
      </div>
      <div v-if="discountAmount > 0" class="flex justify-between" data-test="summary-discount">
        <dt class="text-muted-foreground">
          Discount<template v-if="promoCode"> ({{ promoCode }})</template>
        </dt>
        <dd class="text-status-success-fg">−{{ formatPrice(discountAmount) }}</dd>
      </div>
      <div class="flex items-baseline justify-between border-t border-border pt-3">
        <dt class="font-semibold">Total</dt>
        <dd class="font-display text-2xl font-bold" data-test="summary-total">
          {{ formatPrice(finalPrice) }}
        </dd>
      </div>
    </dl>
    <div v-if="$slots.actions" class="flex flex-col items-center gap-3">
      <slot name="actions" />
    </div>
  </BaseCard>
</template>
