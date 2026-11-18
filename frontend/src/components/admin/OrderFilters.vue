<script setup lang="ts">
import BaseSelect from "@/components/base/BaseSelect.vue";
import type { DeliveryType, OrderStatus, PaymentMethod } from "@/types/order.types";
import {
  DELIVERY_TYPE_LABELS,
  DELIVERY_TYPES,
  ORDER_STATUS_META,
  ORDER_STATUSES,
  PAYMENT_METHOD_META,
  PAYMENT_METHODS,
} from "@/utils/constants/order.constants";

const status = defineModel<OrderStatus | "">("status", { required: true });
const delivery = defineModel<DeliveryType | "">("delivery", { required: true });
const paymentMethod = defineModel<PaymentMethod | "">("paymentMethod", { required: true });

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" as const },
  ...ORDER_STATUSES.map((value) => ({ label: ORDER_STATUS_META[value].label, value })),
];

const DELIVERY_OPTIONS = [
  { label: "All delivery types", value: "" as const },
  ...DELIVERY_TYPES.map((value) => ({ label: DELIVERY_TYPE_LABELS[value], value })),
];

const PAYMENT_OPTIONS = [
  { label: "All payment methods", value: "" as const },
  ...PAYMENT_METHODS.map((value) => ({ label: PAYMENT_METHOD_META[value].label, value })),
];
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <BaseSelect
      :model-value="status"
      :options="STATUS_OPTIONS"
      aria-label="Filter by status"
      data-test="filter-status"
      @update:model-value="status = $event ?? ''"
    />
    <BaseSelect
      :model-value="delivery"
      :options="DELIVERY_OPTIONS"
      aria-label="Filter by delivery type"
      data-test="filter-delivery"
      @update:model-value="delivery = $event ?? ''"
    />
    <BaseSelect
      :model-value="paymentMethod"
      :options="PAYMENT_OPTIONS"
      aria-label="Filter by payment method"
      data-test="filter-payment"
      @update:model-value="paymentMethod = $event ?? ''"
    />
  </div>
</template>
