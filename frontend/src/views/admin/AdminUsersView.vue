<script setup lang="ts">
import Column from "primevue/column";
import { computed, ref } from "vue";

import AdminOrderDetailsModal from "@/components/admin/AdminOrderDetailsModal.vue";
import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";
import AdminTable from "@/components/admin/AdminTable.vue";
import CustomerProfileModal from "@/components/admin/CustomerProfileModal.vue";
import TableActionButtons from "@/components/admin/TableActionButtons.vue";
import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseStatusBadge from "@/components/base/BaseStatusBadge.vue";
import { useMenuFilters } from "@/composables/catalog/useMenuFilters";
import { useAppToast } from "@/composables/common/useAppToast";
import { useCustomerOrders } from "@/composables/orders/useAdminOrders";
import { useOrderDetails } from "@/composables/orders/useOrderDetails";
import { useCustomersCount, useUsers } from "@/composables/profile/useUsers";
import type { User } from "@/types/user.types";
import { ADMIN_USERS_PAGE_SIZE, ROLE_META } from "@/utils/constants/user.constants";
import { formatDate } from "@/utils/format";
import { toMediaUrl } from "@/utils/media";
import { getUserDisplayName } from "@/utils/user";

const { showError } = useAppToast();
const { searchInput, search, page, clearSearch } = useMenuFilters();

const usersQuery = useUsers(() => ({
  page: page.value,
  limit: ADMIN_USERS_PAGE_SIZE,
  search: search.value,
}));
const customersCount = useCustomersCount();

const users = computed(() => usersQuery.data.value?.data ?? []);
const totalPages = computed(() => usersQuery.data.value?.totalPages ?? 0);
const hasLoadError = computed(() => usersQuery.isError.value && !usersQuery.data.value);

const subtitle = computed(() => {
  const total = customersCount.data.value;
  if (total === undefined) {
    return undefined;
  }
  return `${String(total)} registered ${total === 1 ? "customer" : "customers"}`;
});

const selectedUser = ref<User | null>(null);
const profileVisible = ref(false);

const customerOrders = useCustomerOrders(() => selectedUser.value?.id ?? null);
const customerOrderPages = computed(() => customerOrders.data.value?.pages ?? []);
const customerOrderList = computed(() => customerOrderPages.value.flatMap((page) => page.data));
const customerOrdersTotal = computed(() => customerOrderPages.value[0]?.total);

const { selectedOrder, detailsVisible, updating, openOrder, changeStatus } = useOrderDetails();

function openProfile(user: User): void {
  selectedUser.value = user;
  profileVisible.value = true;
}

async function loadMoreOrders(): Promise<void> {
  const result = await customerOrders.fetchNextPage();
  if (result.isError) {
    showError(result.error, "Couldn't load more orders");
  }
}

async function retryOrders(): Promise<void> {
  await customerOrders.refetch();
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <AdminPageHeader title="Users" :subtitle="subtitle" />

    <div class="max-w-md">
      <BaseInput
        v-model="searchInput"
        type="search"
        icon="pi pi-search"
        placeholder="Search by name…"
        aria-label="Search users by name"
        :class="{ 'border-primary/40': searchInput.trim() }"
      />
    </div>

    <BaseEmptyState
      v-if="hasLoadError"
      icon="pi pi-exclamation-circle"
      title="Couldn't load users"
      description="Please check your connection and try again."
    >
      <template #actions>
        <BaseButton variant="secondary" label="Try again" @click="usersQuery.refetch()" />
      </template>
    </BaseEmptyState>

    <template v-else>
      <AdminTable :rows="users" data-key="id" :loading="usersQuery.isPending.value">
        <Column header="User">
          <template #body="{ data }: { data: User }">
            <div class="flex items-center gap-3">
              <BaseAvatar
                :name="data.name"
                :surname="data.surname"
                :email="data.email"
                :src="data.image ? toMediaUrl(data.image) : null"
                size="sm"
              />
              <span class="font-medium text-foreground" data-test="user-name">
                {{ getUserDisplayName(data) }}
              </span>
            </div>
          </template>
        </Column>
        <Column header="Email">
          <template #body="{ data }: { data: User }">
            <span class="text-muted-foreground" data-test="user-email">{{ data.email }}</span>
          </template>
        </Column>
        <Column header="Role">
          <template #body="{ data }: { data: User }">
            <BaseStatusBadge :tone="ROLE_META[data.role].tone" data-test="user-role">
              {{ ROLE_META[data.role].label }}
            </BaseStatusBadge>
          </template>
        </Column>
        <Column header="Verified">
          <template #body="{ data }: { data: User }">
            <BaseStatusBadge
              :tone="data.isEmailVerified ? 'success' : 'processing'"
              dot
              data-test="user-verified"
            >
              {{ data.isEmailVerified ? "Verified" : "Not verified" }}
            </BaseStatusBadge>
          </template>
        </Column>
        <Column header="Member since">
          <template #body="{ data }: { data: User }">
            <span class="whitespace-nowrap text-muted-foreground">
              {{ formatDate(data.createdAt) }}
            </span>
          </template>
        </Column>
        <Column header="" :pt="{ columnHeaderContent: { class: 'justify-end' } }">
          <template #body="{ data }: { data: User }">
            <TableActionButtons
              :item-label="getUserDisplayName(data)"
              :actions="['view']"
              @view="openProfile(data)"
            />
          </template>
        </Column>
        <template #empty>
          <BaseEmptyState
            v-if="search"
            icon="pi pi-search"
            :title="`No users match “${search}”`"
            description="Search matches first and last names."
          >
            <template #actions>
              <BaseButton variant="secondary" label="Clear search" @click="clearSearch" />
            </template>
          </BaseEmptyState>
          <BaseEmptyState v-else icon="pi pi-users" title="No users yet" />
        </template>
      </AdminTable>

      <BasePagination v-model:page="page" :total-pages="totalPages" />
    </template>

    <CustomerProfileModal
      v-if="selectedUser"
      v-model:visible="profileVisible"
      :user="selectedUser"
      :orders="customerOrderList"
      :total-orders="customerOrdersTotal"
      :loading="customerOrders.isPending.value && !customerOrders.isError.value"
      :error="customerOrders.isError.value"
      :has-more="customerOrders.hasNextPage.value"
      :loading-more="customerOrders.isFetchingNextPage.value"
      @open-order="openOrder"
      @load-more="loadMoreOrders"
      @retry="retryOrders"
    />

    <AdminOrderDetailsModal
      v-if="selectedOrder"
      v-model:visible="detailsVisible"
      :order="selectedOrder"
      :customer="selectedUser"
      :updating="updating"
      @change-status="changeStatus"
    />
  </section>
</template>
