<script setup lang="ts">
import { computed } from "vue";

import { MAX_PIZZA_QUANTITY } from "@/utils/constants/limits";

interface BaseQuantityStepperProps {
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
}

const {
  min = 1,
  max = MAX_PIZZA_QUANTITY,
  disabled,
  label = "Quantity",
} = defineProps<BaseQuantityStepperProps>();

const model = defineModel<number>({ required: true });

const canDecrease = computed(() => !disabled && model.value > min);
const canIncrease = computed(() => !disabled && model.value < max);

function step(delta: number): void {
  model.value = Math.min(Math.max(model.value + delta, min), max);
}
</script>

<template>
  <div
    class="inline-flex items-center gap-1 rounded-control border border-border bg-card p-1"
    role="group"
    :aria-label="label"
  >
    <button
      type="button"
      class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      aria-label="Decrease quantity"
      :disabled="!canDecrease"
      @click="step(-1)"
    >
      <i class="pi pi-minus text-xs" aria-hidden="true" />
    </button>
    <output class="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
      {{ model }}
    </output>
    <button
      type="button"
      class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      aria-label="Increase quantity"
      :disabled="!canIncrease"
      @click="step(1)"
    >
      <i class="pi pi-plus text-xs" aria-hidden="true" />
    </button>
  </div>
</template>
