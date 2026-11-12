<script setup lang="ts">
import type { PaymentMethod } from "@/types/order.types";
import { PAYMENT_METHOD_META, PAYMENT_METHODS } from "@/utils/constants/payment-method";

interface PaymentMethodPickerProps {
  error?: string;
}

const { error } = defineProps<PaymentMethodPickerProps>();

const model = defineModel<PaymentMethod | "">({ required: true });
</script>

<template>
  <fieldset class="flex flex-col gap-3" :aria-invalid="!!error || undefined">
    <legend class="mb-3 text-label">Payment method</legend>
    <div class="flex flex-wrap gap-2">
      <label
        v-for="method in PAYMENT_METHODS"
        :key="method"
        :class="[
          'inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
          model === method
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border bg-card text-foreground hover:border-primary/40',
        ]"
      >
        <input
          v-model="model"
          type="radio"
          name="payment-method"
          :value="method"
          class="sr-only"
        />
        <i :class="PAYMENT_METHOD_META[method].icon" aria-hidden="true" />
        {{ PAYMENT_METHOD_META[method].label }}
      </label>
    </div>
    <p v-if="error" class="flex items-center gap-1 text-xs text-primary" role="alert">
      <i class="pi pi-exclamation-circle text-xs" aria-hidden="true" />
      {{ error }}
    </p>
  </fieldset>
</template>
