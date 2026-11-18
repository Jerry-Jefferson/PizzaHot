<script setup lang="ts">
import { computed } from "vue";

import AdminKpiCard from "@/components/admin/AdminKpiCard.vue";
import RecentOrdersCard from "@/components/admin/RecentOrdersCard.vue";
import { useOrderSearch, usePendingOrdersCount } from "@/composables/useAdminOrders";
import { usePopularPizza } from "@/composables/useAnalytics";
import { useCustomersCount, useUsersByIds } from "@/composables/useUsers";
import { RECENT_ORDERS_LIMIT } from "@/utils/constants/order.constants";

const today = new Date();

const customersCount = useCustomersCount();
const pendingCount = usePendingOrdersCount();
const popularPizza = usePopularPizza(today.getMonth() + 1, today.getFullYear());
const recentOrders = useOrderSearch({ limit: RECENT_ORDERS_LIMIT });

const orders = computed(() => recentOrders.data.value?.data ?? []);
const customers = useUsersByIds(() => orders.value.map((order) => order.userId));

const popularPizzaName = computed(() => {
  if (popularPizza.isError.value) {
    return null;
  }
  return popularPizza.data.value?.pizzaName ?? "No orders yet";
});

const popularPizzaCaption = computed(() => {
  const orderCount = popularPizza.data.value?.orderCount;
  if (orderCount === undefined) {
    return undefined;
  }
  return orderCount === 1 ? "1 order" : `${String(orderCount)} orders`;
});
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AdminKpiCard
        label="Customers"
        icon="pi pi-users"
        tone="info"
        :value="customersCount.data.value"
        :loading="customersCount.isPending.value && !customersCount.isError.value"
        data-test="kpi-customers"
      />
      <AdminKpiCard
        label="Pending orders"
        icon="pi pi-clock"
        tone="warning"
        :value="pendingCount.data.value"
        :loading="pendingCount.isPending.value && !pendingCount.isError.value"
        data-test="kpi-pending"
      />
      <AdminKpiCard
        label="Most popular this month"
        icon="pi pi-star"
        tone="success"
        :value="popularPizzaName"
        :caption="popularPizzaCaption"
        :loading="popularPizza.isPending.value && !popularPizza.isError.value"
        data-test="kpi-popular"
      />
    </div>

    <RecentOrdersCard
      :orders="orders"
      :customers="customers"
      :loading="recentOrders.isPending.value && !recentOrders.isError.value"
      :error="recentOrders.isError.value"
      @retry="recentOrders.refetch()"
    />
  </section>
</template>
