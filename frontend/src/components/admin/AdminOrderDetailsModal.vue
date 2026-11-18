<script setup lang="ts">
import Skeleton from "primevue/skeleton";
import { computed } from "vue";

import BaseModal from "@/components/base/BaseModal.vue";
import BaseSubtlePanel from "@/components/base/BaseSubtlePanel.vue";
import OrderItemTile from "@/components/order/OrderItemTile.vue";
import OrderStatusBadge from "@/components/order/OrderStatusBadge.vue";
import { DeliveryType, type NextOrderStatus, type Order } from "@/types/order.types";
import type { User } from "@/types/user.types";
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_META } from "@/utils/constants/order.constants";
import { formatDateTime, formatPrice, shortId } from "@/utils/format";
import { getCustomerLabel } from "@/utils/user";

import OrderStatusActions from "./OrderStatusActions.vue";

interface AdminOrderDetailsModalProps {
  order: Order;
  customer?: User | null;
  updating?: boolean;
}

interface AdminOrderDetailsModalEmits {
  changeStatus: [status: NextOrderStatus];
}

const { order, customer, updating } = defineProps<AdminOrderDetailsModalProps>();
const emit = defineEmits<AdminOrderDetailsModalEmits>();

const visible = defineModel<boolean>("visible", { required: true });

const customerLabel = computed(() => getCustomerLabel(order.userId, customer));
const customerEmail = computed(() =>
  customer && customer.email !== customerLabel.value ? customer.email : undefined
);
const discount = computed(() => order.discountAmount ?? 0);
const payment = computed(() => PAYMENT_METHOD_META[order.paymentMethod]);
</script>

<template>
  <BaseModal v-model:visible="visible" :header="`Order ${shortId(order.id)}`">
    <div class="flex flex-col gap-5" data-test="order-details">
      <div class="flex flex-col gap-1">
        <div class="flex items-start justify-between gap-3">
          <p class="min-w-0 text-sm text-muted-foreground" data-test="order-customer">
            <template v-if="customerLabel !== undefined">
              {{ customerLabel }}<template v-if="customerEmail"> · {{ customerEmail }}</template>
            </template>
            <Skeleton v-else width="12rem" height="1rem" />
          </p>
          <OrderStatusBadge :status="order.status" />
        </div>
        <p class="text-caption">{{ formatDateTime(order.createdAt) }}</p>
      </div>

      <ul class="divide-y divide-border rounded-xl border border-border">
        <li
          v-for="item in order.orderItems"
          :key="item.id"
          class="flex items-center gap-3 px-3 py-2.5"
          data-test="order-item"
        >
          <OrderItemTile size="sm" />
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-label">{{ item.pizzaName }}</span>
            <span class="text-caption">×{{ item.quantity }}</span>
          </div>
          <span class="shrink-0 text-sm font-semibold">{{ formatPrice(item.subtotal) }}</span>
        </li>
      </ul>

      <BaseSubtlePanel>
        <dl class="flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Subtotal</dt>
            <dd>{{ formatPrice(order.totalPrice) }}</dd>
          </div>
          <div v-if="discount > 0" class="flex justify-between" data-test="order-discount">
            <dt class="text-muted-foreground">
              Discount<template v-if="order.codeApplied"> ({{ order.codeApplied }})</template>
            </dt>
            <dd class="text-status-success-fg">−{{ formatPrice(discount) }}</dd>
          </div>
          <div class="flex justify-between border-t border-border pt-2 font-semibold">
            <dt>Total</dt>
            <dd data-test="order-total">{{ formatPrice(order.finalPrice) }}</dd>
          </div>
        </dl>
      </BaseSubtlePanel>

      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt class="text-muted-foreground">Delivery</dt>
        <dd data-test="order-delivery">{{ DELIVERY_TYPE_LABELS[order.delivery] }}</dd>
        <template v-if="order.delivery === DeliveryType.DELIVERY">
          <dt class="text-muted-foreground">Address</dt>
          <dd class="break-words" data-test="order-address">{{ order.address }}</dd>
        </template>
        <dt class="text-muted-foreground">Payment</dt>
        <dd class="flex items-center gap-2">
          <i :class="payment.icon" aria-hidden="true" />{{ payment.label }}
        </dd>
        <template v-if="order.comment">
          <dt class="text-muted-foreground">Comment</dt>
          <dd class="break-words whitespace-pre-line" data-test="order-comment">
            {{ order.comment }}
          </dd>
        </template>
      </dl>

      <OrderStatusActions
        :status="order.status"
        :delivery="order.delivery"
        :disabled="updating"
        class="border-t border-border pt-4"
        @change="emit('changeStatus', $event)"
      />
    </div>
  </BaseModal>
</template>
