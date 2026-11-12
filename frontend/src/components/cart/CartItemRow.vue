<script setup lang="ts">
import BaseQuantityStepper from "@/components/base/BaseQuantityStepper.vue";
import type { CartItem } from "@/types/cart.types";
import { formatPrice } from "@/utils/format";
import { toMediaUrl } from "@/utils/media-url";

interface CartItemRowProps {
  item: CartItem;
  disabled?: boolean;
}

interface CartItemRowEmits {
  updateQuantity: [quantity: number];
  remove: [];
}

const { item, disabled } = defineProps<CartItemRowProps>();
const emit = defineEmits<CartItemRowEmits>();
</script>

<template>
  <li class="flex gap-4 py-5 first:pt-0 last:pb-0">
    <img
      v-if="item.pizza"
      :src="toMediaUrl(item.pizza.image)"
      :alt="item.pizza.name"
      class="size-20 shrink-0 rounded-xl bg-card-subtle object-cover sm:size-24"
    />
    <span
      v-else
      class="flex size-20 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:size-24"
    >
      <i class="pi pi-ban text-xl" aria-hidden="true" />
    </span>

    <div class="flex min-w-0 flex-1 flex-col gap-3">
      <div class="flex items-start justify-between gap-2">
        <div v-if="item.pizza" class="flex min-w-0 flex-col gap-0.5">
          <h3 class="truncate text-card-title">{{ item.pizza.name }}</h3>
          <p class="text-caption">{{ formatPrice(item.pizza.price) }} each</p>
        </div>
        <p v-else class="self-center text-sm text-muted-foreground" data-test="unavailable-item">
          This pizza is no longer available
        </p>
        <button
          type="button"
          class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          :aria-label="item.pizza ? `Remove ${item.pizza.name}` : 'Remove unavailable pizza'"
          :disabled="disabled"
          @click="emit('remove')"
        >
          <i class="pi pi-trash" aria-hidden="true" />
        </button>
      </div>

      <div v-if="item.pizza" class="flex flex-wrap items-center justify-between gap-3">
        <BaseQuantityStepper
          :model-value="item.quantity"
          :min="0"
          :disabled="disabled"
          :label="`Quantity of ${item.pizza.name}`"
          @update:model-value="emit('updateQuantity', $event)"
        />
        <span class="font-semibold" data-test="line-total">
          {{ formatPrice(item.pizza.price * item.quantity) }}
        </span>
      </div>
    </div>
  </li>
</template>
