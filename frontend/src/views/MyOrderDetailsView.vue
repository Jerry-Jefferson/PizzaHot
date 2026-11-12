<script setup lang="ts">
import Skeleton from "primevue/skeleton";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getErrorStatus } from "@/api/errors";
import BaseBackLink from "@/components/base/BaseBackLink.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import OrderDeliveryDetailsCard from "@/components/order/OrderDeliveryDetailsCard.vue";
import OrderItemsCard from "@/components/order/OrderItemsCard.vue";
import OrderPlacedBanner from "@/components/order/OrderPlacedBanner.vue";
import OrderProgressStepper from "@/components/order/OrderProgressStepper.vue";
import OrderStatusBadge from "@/components/order/OrderStatusBadge.vue";
import { useMyOrder } from "@/composables/useMyOrders";
import { OrderStatus } from "@/types/order.types";
import { formatLongDate, shortId } from "@/utils/format";

const NOT_FOUND_STATUSES = new Set([400, 404]);

const route = useRoute();
const router = useRouter();

const orderId = computed(() => String(route.params.id));
const { data: order, isPending, error, refetch } = useMyOrder(orderId);

const isJustPlaced = computed(() => route.query.placed === "1");
const isNotFound = computed(() => NOT_FOUND_STATUSES.has(getErrorStatus(error.value) ?? 0));
const isCancelled = computed(() => order.value?.status === OrderStatus.CANCELLED);
const isAwaitingConfirmation = computed(() => order.value?.status === OrderStatus.PENDING);
</script>

<template>
  <section class="mx-auto flex w-full max-w-2xl flex-col gap-6">
    <BaseBackLink :to="{ name: 'my-orders' }" label="Back to orders" />

    <div v-if="isPending" class="flex flex-col gap-6" aria-hidden="true" data-test="order-skeleton">
      <Skeleton width="50%" height="2.5rem" />
      <Skeleton height="7rem" border-radius="1rem" />
      <Skeleton height="14rem" border-radius="1rem" />
    </div>

    <BaseEmptyState
      v-else-if="isNotFound"
      icon="pi pi-search"
      title="Order not found"
      description="This order doesn't exist or doesn't belong to your account."
    >
      <template #actions>
        <BaseButton
          variant="secondary"
          icon="pi pi-arrow-left"
          label="Back to orders"
          @click="router.push({ name: 'my-orders' })"
        />
      </template>
    </BaseEmptyState>

    <BaseEmptyState
      v-else-if="!order"
      icon="pi pi-exclamation-circle"
      title="Couldn't load this order"
      description="Please check your connection and try again."
    >
      <template #actions>
        <BaseButton variant="secondary" label="Try again" @click="refetch()" />
      </template>
    </BaseEmptyState>

    <template v-else>
      <header class="flex flex-col gap-1">
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-page-title">Order {{ shortId(order.id) }}</h1>
          <OrderStatusBadge :status="order.status" />
        </div>
        <time :datetime="order.createdAt" class="text-muted-foreground">
          {{ formatLongDate(order.createdAt) }}
        </time>
      </header>

      <OrderPlacedBanner v-if="isJustPlaced" />

      <BaseCard>
        <h2 class="text-section-title">Order Progress</h2>
        <p
          v-if="isCancelled"
          class="flex items-center gap-2 rounded-control bg-primary/5 px-3 py-2.5 text-sm text-primary"
          role="status"
          data-test="order-cancelled"
        >
          <i class="pi pi-times-circle" aria-hidden="true" />
          This order was cancelled
        </p>
        <template v-else>
          <p v-if="isAwaitingConfirmation" class="text-caption" data-test="order-pending">
            Waiting for the restaurant to confirm your order
          </p>
          <OrderProgressStepper :status="order.status" :delivery="order.delivery" />
        </template>
      </BaseCard>

      <OrderItemsCard :order="order" />
      <OrderDeliveryDetailsCard :order="order" />
    </template>
  </section>
</template>
