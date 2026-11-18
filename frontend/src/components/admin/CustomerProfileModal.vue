<script setup lang="ts">
import Skeleton from "primevue/skeleton";
import { computed } from "vue";

import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseStatTile from "@/components/base/BaseStatTile.vue";
import BaseSubtlePanel from "@/components/base/BaseSubtlePanel.vue";
import OrderStatusBadge from "@/components/order/OrderStatusBadge.vue";
import type { Order } from "@/types/order.types";
import type { User } from "@/types/user.types";
import { CUSTOMER_ORDERS_PAGE_SIZE } from "@/utils/constants/order.constants";
import { formatDate, formatMonthYear, formatPrice, shortId } from "@/utils/format";
import { toMediaUrl } from "@/utils/media";
import { countOrderItems } from "@/utils/order";
import { getUserDisplayName } from "@/utils/user";

interface CustomerProfileModalProps {
  user: User;
  orders: Order[];
  totalOrders?: number;
  loading?: boolean;
  error?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
}

interface CustomerProfileModalEmits {
  openOrder: [order: Order];
  loadMore: [];
  retry: [];
}

const { user, orders, totalOrders, loading, error, hasMore, loadingMore } =
  defineProps<CustomerProfileModalProps>();
const emit = defineEmits<CustomerProfileModalEmits>();

const visible = defineModel<boolean>("visible", { required: true });

const displayName = computed(() => getUserDisplayName(user));
const avatarSrc = computed(() => (user.image ? toMediaUrl(user.image) : null));

function itemCountLabel(order: Order): string {
  const count = countOrderItems(order.orderItems);
  return `${String(count)} ${count === 1 ? "item" : "items"}`;
}
</script>

<template>
  <BaseModal v-model:visible="visible" header="Customer profile" width-class="max-w-xl">
    <div class="flex flex-col gap-5" data-test="customer-profile">
      <BaseSubtlePanel>
        <div class="flex items-center gap-4">
          <BaseAvatar
            :name="user.name"
            :surname="user.surname"
            :email="user.email"
            :src="avatarSrc"
            size="lg"
          />
          <div class="flex min-w-0 flex-col">
            <span class="truncate font-display text-lg font-semibold" data-test="customer-name">
              {{ displayName }}
            </span>
            <span class="truncate text-sm text-muted-foreground" data-test="customer-email">
              {{ user.email }}
            </span>
          </div>
        </div>
      </BaseSubtlePanel>

      <div class="grid grid-cols-2 gap-4">
        <BaseStatTile
          :value="totalOrders ?? '—'"
          label="Total orders"
          data-test="customer-total-orders"
        />
        <BaseStatTile
          :value="formatMonthYear(user.createdAt)"
          label="Member since"
          data-test="customer-member-since"
        />
      </div>

      <section class="flex flex-col gap-3">
        <h3 class="text-card-title">Order history</h3>

        <div v-if="loading" class="flex flex-col gap-2" aria-hidden="true">
          <Skeleton v-for="index in CUSTOMER_ORDERS_PAGE_SIZE" :key="index" height="3rem" />
        </div>

        <BaseEmptyState
          v-else-if="error && orders.length === 0"
          icon="pi pi-exclamation-circle"
          title="Couldn't load orders"
        >
          <template #actions>
            <BaseButton variant="secondary" size="sm" label="Try again" @click="emit('retry')" />
          </template>
        </BaseEmptyState>

        <BaseEmptyState
          v-else-if="orders.length === 0"
          icon="pi pi-receipt"
          title="No orders yet"
          description="This customer hasn't placed an order."
        />

        <template v-else>
          <ul class="divide-y divide-border rounded-xl border border-border">
            <li v-for="order in orders" :key="order.id">
              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                :aria-label="`View order ${shortId(order.id)}`"
                data-test="customer-order"
                @click="emit('openOrder', order)"
              >
                <div class="flex min-w-0 flex-1 flex-col">
                  <span class="font-mono text-sm">{{ shortId(order.id) }}</span>
                  <span class="text-caption">
                    {{ formatDate(order.createdAt) }} · {{ itemCountLabel(order) }}
                  </span>
                </div>
                <span class="text-sm font-semibold whitespace-nowrap">
                  {{ formatPrice(order.finalPrice) }}
                </span>
                <OrderStatusBadge :status="order.status" />
              </button>
            </li>
          </ul>
          <BaseButton
            v-if="hasMore"
            variant="secondary"
            size="sm"
            label="Load more"
            :loading="loadingMore"
            class="self-center"
            data-test="load-more-orders"
            @click="emit('loadMore')"
          />
        </template>
      </section>
    </div>
  </BaseModal>
</template>
