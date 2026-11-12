<script setup lang="ts">
import { computed } from "vue";

import BaseStatusBadge from "@/components/base/BaseStatusBadge.vue";
import type { OrderStatus } from "@/types/order.types";
import { ORDER_STATUS_META } from "@/utils/constants/order-status";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const { status } = defineProps<OrderStatusBadgeProps>();

const meta = computed(() => ORDER_STATUS_META[status]);
</script>

<template>
  <BaseStatusBadge :tone="meta.tone" dot data-test="order-status">{{ meta.label }}</BaseStatusBadge>
</template>
