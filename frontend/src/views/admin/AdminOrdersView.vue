<script setup lang="ts">
import Column from "primevue/column";
import Skeleton from "primevue/skeleton";
import { computed } from "vue";

import AdminOrderDetailsModal from "@/components/admin/AdminOrderDetailsModal.vue";
import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";
import AdminTable from "@/components/admin/AdminTable.vue";
import OrderFilters from "@/components/admin/OrderFilters.vue";
import TableActionButtons from "@/components/admin/TableActionButtons.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseStatusBadge from "@/components/base/BaseStatusBadge.vue";
import OrderStatusBadge from "@/components/order/OrderStatusBadge.vue";
import { useOrderSearch } from "@/composables/orders/useAdminOrders";
import { useOrderDetails } from "@/composables/orders/useOrderDetails";
import { useOrderFilters } from "@/composables/orders/useOrderFilters";
import { useUsersByIds } from "@/composables/profile/useUsers";
import type { Order } from "@/types/order.types";
import type { User } from "@/types/user.types";
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_META } from "@/utils/constants/order.constants";
import { formatDateTime, formatPrice, shortId } from "@/utils/format";
import { getCustomerLabel } from "@/utils/user";

const { status, delivery, paymentMethod, page, hasFilters, searchQuery, clearFilters } =
  useOrderFilters();

const ordersQuery = useOrderSearch(searchQuery);
const allOrdersQuery = useOrderSearch({ limit: 1 });
const { selectedOrder, detailsVisible, updating, openOrder, changeStatus } = useOrderDetails();

const orders = computed(() => ordersQuery.data.value?.data ?? []);
const totalPages = computed(() => ordersQuery.data.value?.totalPages ?? 0);
const hasLoadError = computed(() => ordersQuery.isError.value && !ordersQuery.data.value);

const customers = useUsersByIds(() => [
  ...orders.value.map((order) => order.userId),
  selectedOrder.value?.userId ?? null,
]);

const subtitle = computed(() => {
  const total = allOrdersQuery.data.value?.total;
  if (total === undefined) {
    return undefined;
  }
  return `${String(total)} total ${total === 1 ? "order" : "orders"}`;
});

function customerOf(order: Order): User | null | undefined {
  return order.userId === null ? undefined : customers.value.get(order.userId);
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <AdminPageHeader title="Orders" :subtitle="subtitle" />

    <OrderFilters
      v-model:status="status"
      v-model:delivery="delivery"
      v-model:payment-method="paymentMethod"
    />

    <BaseEmptyState
      v-if="hasLoadError"
      icon="pi pi-exclamation-circle"
      title="Couldn't load orders"
      description="Please check your connection and try again."
    >
      <template #actions>
        <BaseButton variant="secondary" label="Try again" @click="ordersQuery.refetch()" />
      </template>
    </BaseEmptyState>

    <template v-else>
      <AdminTable :rows="orders" data-key="id" :loading="ordersQuery.isPending.value">
        <Column header="Order ID">
          <template #body="{ data }: { data: Order }">
            <span class="font-mono text-sm whitespace-nowrap" data-test="order-id">
              {{ shortId(data.id) }}
            </span>
          </template>
        </Column>
        <Column header="Customer">
          <template #body="{ data }: { data: Order }">
            <div
              v-if="getCustomerLabel(data.userId, customerOf(data)) !== undefined"
              class="flex min-w-0 flex-col"
            >
              <span class="font-medium text-foreground" data-test="order-customer-name">
                {{ getCustomerLabel(data.userId, customerOf(data)) }}
              </span>
              <span v-if="customerOf(data)" class="text-caption">
                {{ customerOf(data)?.email }}
              </span>
            </div>
            <Skeleton v-else width="8rem" height="1rem" />
          </template>
        </Column>
        <Column header="Date">
          <template #body="{ data }: { data: Order }">
            <span class="whitespace-nowrap text-muted-foreground">
              {{ formatDateTime(data.createdAt) }}
            </span>
          </template>
        </Column>
        <Column header="Total">
          <template #body="{ data }: { data: Order }">
            <span class="font-semibold whitespace-nowrap">{{ formatPrice(data.finalPrice) }}</span>
          </template>
        </Column>
        <Column header="Payment">
          <template #body="{ data }: { data: Order }">
            <span class="flex items-center gap-2 whitespace-nowrap">
              <i :class="PAYMENT_METHOD_META[data.paymentMethod].icon" aria-hidden="true" />
              {{ PAYMENT_METHOD_META[data.paymentMethod].label }}
            </span>
          </template>
        </Column>
        <Column header="Delivery">
          <template #body="{ data }: { data: Order }">
            <BaseStatusBadge>{{ DELIVERY_TYPE_LABELS[data.delivery] }}</BaseStatusBadge>
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }: { data: Order }">
            <OrderStatusBadge :status="data.status" />
          </template>
        </Column>
        <Column header="" :pt="{ columnHeaderContent: { class: 'justify-end' } }">
          <template #body="{ data }: { data: Order }">
            <TableActionButtons
              :item-label="`order ${shortId(data.id)}`"
              :actions="['view']"
              @view="openOrder(data)"
            />
          </template>
        </Column>
        <template #empty>
          <BaseEmptyState
            v-if="hasFilters"
            icon="pi pi-filter-slash"
            title="No orders match these filters"
            description="Try a different combination."
          >
            <template #actions>
              <BaseButton variant="secondary" label="Clear filters" @click="clearFilters" />
            </template>
          </BaseEmptyState>
          <BaseEmptyState
            v-else
            icon="pi pi-receipt"
            title="No orders yet"
            description="New orders will show up here."
          />
        </template>
      </AdminTable>

      <BasePagination v-model:page="page" :total-pages="totalPages" />
    </template>

    <AdminOrderDetailsModal
      v-if="selectedOrder"
      v-model:visible="detailsVisible"
      :order="selectedOrder"
      :customer="customerOf(selectedOrder)"
      :updating="updating"
      @change-status="changeStatus"
    />
  </section>
</template>
