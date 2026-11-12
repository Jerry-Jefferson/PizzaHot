<script setup lang="ts">
import { computed } from "vue";

import { type DeliveryType, OrderStatus } from "@/types/order.types";
import { getProgressSteps, getStepState } from "@/utils/constants/order-progress";

interface OrderProgressStepperProps {
  status: OrderStatus;
  delivery: DeliveryType;
}

const { status, delivery } = defineProps<OrderProgressStepperProps>();

const steps = computed(() =>
  getProgressSteps(delivery).map((step) => ({ ...step, state: getStepState(step, status) }))
);

const CIRCLE_CLASSES = {
  done: "bg-primary text-primary-foreground",
  current: "border-2 border-primary bg-card",
  upcoming: "border-2 border-border bg-card",
} as const;
</script>

<template>
  <ol
    v-if="status !== OrderStatus.CANCELLED"
    class="flex flex-col min-[480px]:flex-row"
    aria-label="Order progress"
  >
    <li
      v-for="(step, index) in steps"
      :key="step.status"
      class="relative flex items-center gap-3 pb-6 last:pb-0 min-[480px]:flex-1 min-[480px]:flex-col min-[480px]:gap-2 min-[480px]:pb-0"
      :data-state="step.state"
      :aria-current="step.state === 'current' ? 'step' : undefined"
    >
      <span
        v-if="index > 0"
        :class="[
          'absolute -top-6 left-[15px] h-6 w-0.5 min-[480px]:top-[15px] min-[480px]:right-1/2 min-[480px]:left-auto min-[480px]:h-0.5 min-[480px]:w-full',
          step.state === 'upcoming' ? 'bg-border' : 'bg-primary',
        ]"
        aria-hidden="true"
        data-test="step-connector"
      />
      <span
        :class="[
          'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
          CIRCLE_CLASSES[step.state],
        ]"
        data-test="step-circle"
      >
        <i v-if="step.state === 'done'" class="pi pi-check text-xs" aria-hidden="true" />
        <span
          v-else-if="step.state === 'current'"
          class="size-2.5 animate-pulse rounded-full bg-primary"
          aria-hidden="true"
        />
      </span>
      <span
        :class="[
          'text-xs font-medium min-[480px]:text-center',
          step.state === 'upcoming' ? 'text-muted-foreground' : 'text-primary',
        ]"
      >
        {{ step.label }}
      </span>
    </li>
  </ol>
</template>
