<script setup lang="ts">
import { DeliveryType } from "@/types/order.types";

interface DeliveryOption {
  value: DeliveryType;
  label: string;
  emoji: string;
}

const OPTIONS: DeliveryOption[] = [
  { value: DeliveryType.DELIVERY, label: "Delivery", emoji: "🛵" },
  { value: DeliveryType.PICKUP, label: "Pick up", emoji: "🏪" },
];

const model = defineModel<DeliveryType>({ required: true });
</script>

<template>
  <fieldset class="flex flex-col gap-3">
    <legend class="mb-3 text-label">Delivery method</legend>
    <div class="grid grid-cols-2 gap-3">
      <label
        v-for="option in OPTIONS"
        :key="option.value"
        :class="[
          'flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
          model === option.value
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border bg-card text-foreground hover:border-primary/40',
        ]"
      >
        <input
          v-model="model"
          type="radio"
          name="delivery"
          :value="option.value"
          class="sr-only"
        />
        <span class="text-2xl" aria-hidden="true">{{ option.emoji }}</span>
        {{ option.label }}
      </label>
    </div>
  </fieldset>
</template>
