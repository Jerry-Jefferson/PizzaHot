<script setup lang="ts">
import { computed } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import { type DeliveryType, type NextOrderStatus, OrderStatus } from "@/types/order.types";
import { getNextStatuses, getStatusActionLabel } from "@/utils/order";

interface OrderStatusActionsProps {
  status: OrderStatus;
  delivery: DeliveryType;
  disabled?: boolean;
}

interface OrderStatusActionsEmits {
  change: [status: NextOrderStatus];
}

const { status, delivery, disabled } = defineProps<OrderStatusActionsProps>();
const emit = defineEmits<OrderStatusActionsEmits>();

const nextStatuses = computed(() => getNextStatuses(status, delivery));
</script>

<template>
  <div class="flex flex-col gap-2" data-test="status-actions">
    <template v-if="nextStatuses.length > 0">
      <span class="text-label">Update status</span>
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-for="nextStatus in nextStatuses"
          :key="nextStatus"
          size="sm"
          :variant="nextStatus === OrderStatus.CANCELLED ? 'danger-outline' : 'secondary'"
          :label="getStatusActionLabel(nextStatus, delivery)"
          :disabled="disabled"
          :data-test="`status-action-${nextStatus}`"
          @click="emit('change', nextStatus)"
        />
      </div>
    </template>
    <p v-else class="text-caption" data-test="order-closed">This order is closed.</p>
  </div>
</template>
