<script setup lang="ts">
import { computed } from "vue";

import BaseCard from "@/components/base/BaseCard.vue";
import { DeliveryType, type Order } from "@/types/order.types";
import { PAYMENT_METHOD_META } from "@/utils/constants/payment-method";

interface OrderDeliveryDetailsCardProps {
  order: Pick<Order, "delivery" | "paymentMethod" | "address" | "comment">;
}

const { order } = defineProps<OrderDeliveryDetailsCardProps>();

const isDelivery = computed(() => order.delivery === DeliveryType.DELIVERY);
const payment = computed(() => PAYMENT_METHOD_META[order.paymentMethod]);
</script>

<template>
  <BaseCard>
    <h2 class="text-section-title">Delivery details</h2>
    <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
      <div class="flex flex-col gap-1">
        <dt class="text-caption">Method</dt>
        <dd class="text-label" data-test="delivery-method">
          <span aria-hidden="true">{{ isDelivery ? "🛵" : "🏪" }}</span>
          {{ isDelivery ? "Delivery" : "Pick up" }}
        </dd>
      </div>
      <div class="flex flex-col gap-1">
        <dt class="text-caption">Payment</dt>
        <dd class="flex items-center gap-2 text-label" data-test="payment-method">
          <i :class="payment.icon" aria-hidden="true" />
          {{ payment.label }}
        </dd>
      </div>
      <div v-if="isDelivery" class="col-span-2 flex flex-col gap-1">
        <dt class="text-caption">Address</dt>
        <dd class="text-label break-words" data-test="delivery-address">{{ order.address }}</dd>
      </div>
      <div v-if="order.comment" class="col-span-2 flex flex-col gap-1">
        <dt class="text-caption">Instructions</dt>
        <dd class="text-label break-words whitespace-pre-line" data-test="delivery-comment">
          {{ order.comment }}
        </dd>
      </div>
    </dl>
  </BaseCard>
</template>
