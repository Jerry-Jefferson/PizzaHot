<script setup lang="ts">
import Skeleton from "primevue/skeleton";
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BaseIconCircle from "@/components/base/BaseIconCircle.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import OrderListCard from "@/components/order/OrderListCard.vue";
import { MY_ORDERS_PAGE_SIZE, useMyOrders } from "@/composables/useMyOrders";

const route = useRoute();
const router = useRouter();

const page = computed({
  get: () => {
    const value = Number(route.query.page);
    return Number.isInteger(value) && value > 1 ? value : 1;
  },
  set: (value: number) => {
    void router.push({ query: { ...route.query, page: value > 1 ? String(value) : undefined } });
  },
});

const ordersQuery = useMyOrders(() => ({ page: page.value, limit: MY_ORDERS_PAGE_SIZE }), {
  pollWhileActive: true,
});

const orders = computed(() => ordersQuery.data.value?.data ?? []);
const totalPages = computed(() => ordersQuery.data.value?.totalPages ?? 0);
const isEmpty = computed(() => ordersQuery.isSuccess.value && orders.value.length === 0);
</script>

<template>
  <section class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <h1 class="text-page-title">My Orders</h1>

    <div
      v-if="ordersQuery.isPending.value"
      class="flex flex-col gap-3"
      aria-hidden="true"
      data-test="orders-skeleton"
    >
      <Skeleton v-for="index in 3" :key="index" height="8.5rem" border-radius="1rem" />
    </div>

    <BaseEmptyState
      v-else-if="ordersQuery.isError.value && !ordersQuery.data.value"
      icon="pi pi-exclamation-circle"
      title="Couldn't load your orders"
      description="Please check your connection and try again."
    >
      <template #actions>
        <BaseButton variant="secondary" label="Try again" @click="ordersQuery.refetch()" />
      </template>
    </BaseEmptyState>

    <div
      v-else-if="isEmpty"
      class="flex flex-col items-center gap-3 px-4 py-16 text-center"
      data-test="orders-empty"
    >
      <BaseIconCircle icon="pi pi-clipboard" />
      <h2 class="text-label font-bold">No orders yet</h2>
      <p class="max-w-sm text-muted-foreground">
        Once you place an order, you'll be able to track it here.
      </p>
      <RouterLink
        :to="{ name: 'menu' }"
        class="mt-2 inline-flex h-10 items-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Browse menu
      </RouterLink>
    </div>

    <template v-else>
      <ul class="flex flex-col gap-3">
        <li v-for="order in orders" :key="order.id">
          <OrderListCard :order="order" />
        </li>
      </ul>
      <BasePagination v-model:page="page" :total-pages="totalPages" />
    </template>
  </section>
</template>
