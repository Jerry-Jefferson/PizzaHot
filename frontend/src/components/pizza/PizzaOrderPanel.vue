<script setup lang="ts">
import { computed } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseQuantityStepper from "@/components/base/BaseQuantityStepper.vue";
import { MAX_PIZZA_QUANTITY } from "@/utils/constants/limits";
import { formatPrice } from "@/utils/format";

type PendingAction = "add" | "order";

interface PizzaOrderPanelProps {
  price: number;
  inCart?: number;
  pendingAction?: PendingAction | null;
}

interface PizzaOrderPanelEmits {
  addToCart: [];
  orderNow: [];
}

const { price, inCart = 0, pendingAction = null } = defineProps<PizzaOrderPanelProps>();
const emit = defineEmits<PizzaOrderPanelEmits>();

const quantity = defineModel<number>("quantity", { required: true });

const total = computed(() => price * quantity.value);
const remaining = computed(() => Math.max(MAX_PIZZA_QUANTITY - inCart, 0));
const exceedsLimit = computed(() => inCart + quantity.value > MAX_PIZZA_QUANTITY);
const limitWarning = computed(() =>
  remaining.value === 0
    ? `You already have the maximum of ${String(MAX_PIZZA_QUANTITY)} in your cart.`
    : `You can add up to ${String(remaining.value)} more (limit ${String(MAX_PIZZA_QUANTITY)} per pizza).`
);
const isBusy = computed(() => pendingAction !== null);
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <span class="text-caption">Quantity</span>
        <BaseQuantityStepper v-model="quantity" :disabled="isBusy" />
      </div>
      <div class="flex flex-col items-end gap-1">
        <span class="text-caption">Total</span>
        <span class="font-display text-3xl font-bold" data-test="pizza-total">
          {{ formatPrice(total) }}
        </span>
      </div>
    </div>

    <p v-if="inCart > 0" class="text-caption" data-test="in-cart-caption">
      Already in cart: {{ inCart }}
    </p>
    <p
      v-if="exceedsLimit"
      class="flex items-center gap-1.5 text-xs text-primary"
      role="alert"
      data-test="limit-warning"
    >
      <i class="pi pi-exclamation-circle" aria-hidden="true" />
      {{ limitWarning }}
    </p>

    <div class="flex flex-col gap-3 sm:flex-row">
      <BaseButton
        class="flex-1"
        size="lg"
        icon="pi pi-shopping-cart"
        label="Add to cart"
        :loading="pendingAction === 'add'"
        :disabled="exceedsLimit || isBusy"
        @click="emit('addToCart')"
      />
      <BaseButton
        size="lg"
        variant="outline"
        label="Order now"
        :loading="pendingAction === 'order'"
        :disabled="exceedsLimit || isBusy"
        @click="emit('orderNow')"
      />
    </div>

    <dl class="flex justify-between border-t border-border pt-4 text-sm">
      <dt class="text-muted-foreground">Price</dt>
      <dd class="font-semibold" data-test="pizza-price">{{ formatPrice(price) }}</dd>
    </dl>
  </div>
</template>
