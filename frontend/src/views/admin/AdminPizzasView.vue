<script setup lang="ts">
import Column from "primevue/column";
import { computed } from "vue";
import { useRouter } from "vue-router";

import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";
import AdminTable from "@/components/admin/AdminTable.vue";
import TableActionButtons from "@/components/admin/TableActionButtons.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import MenuSearchBar from "@/components/pizza/MenuSearchBar.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useConfirmDanger } from "@/composables/useConfirmDanger";
import { useMenuFilters } from "@/composables/useMenuFilters";
import { useDeletePizza, usePizzas } from "@/composables/usePizzas";
import type { Pizza } from "@/types/pizza.types";
import { ADMIN_PIZZAS_PAGE_SIZE } from "@/utils/constants/pizza.constants";
import { ROUTES } from "@/utils/constants/routes.constants";
import { formatPrice } from "@/utils/format";
import { toMediaUrl } from "@/utils/media";

const router = useRouter();
const { showSuccess } = useAppToast();
const confirmDanger = useConfirmDanger();

const { searchInput, search, page, clearSearch } = useMenuFilters();

const pizzasQuery = usePizzas(() => ({
  page: page.value,
  limit: ADMIN_PIZZAS_PAGE_SIZE,
  search: search.value,
}));
const catalogQuery = usePizzas({ page: 1, limit: 1 });
const deletePizza = useDeletePizza();

const pizzas = computed(() => pizzasQuery.data.value?.data ?? []);
const totalPages = computed(() => pizzasQuery.data.value?.totalPages ?? 0);
const hasLoadError = computed(() => pizzasQuery.isError.value && !pizzasQuery.data.value);

const subtitle = computed(() => {
  const total = catalogQuery.data.value?.total;
  if (total === undefined) {
    return undefined;
  }
  return `${String(total)} ${total === 1 ? "pizza" : "pizzas"} on the menu`;
});

function ingredientList(pizza: Pizza): string {
  return (pizza.ingredients ?? []).map((ingredient) => ingredient.name).join(", ");
}

async function goToNewPizza(): Promise<void> {
  await router.push({ name: ROUTES.ADMIN_PIZZAS_NEW.NAME });
}

async function goToEditPizza(pizza: Pizza): Promise<void> {
  await router.push({ name: ROUTES.ADMIN_PIZZAS_EDIT.NAME, params: { id: pizza.id } });
}

async function removePizza(pizza: Pizza): Promise<void> {
  const wasLastOnPage = pizzas.value.length === 1 && page.value > 1;
  await deletePizza.mutateAsync(pizza.id);
  if (wasLastOnPage) {
    page.value = page.value - 1;
  }
  showSuccess("Pizza deleted");
}

function confirmDelete(pizza: Pizza): void {
  confirmDanger({
    title: `Delete "${pizza.name}"?`,
    message:
      "This pizza will be permanently removed from your menu. Existing orders will not be affected.",
    confirmLabel: "Delete pizza",
    onConfirm: () => removePizza(pizza),
  });
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <AdminPageHeader title="Pizza Management" :subtitle="subtitle">
      <template #actions>
        <BaseButton icon="pi pi-plus" label="Add Pizza" @click="goToNewPizza" />
      </template>
    </AdminPageHeader>

    <div class="max-w-md">
      <MenuSearchBar v-model="searchInput" />
    </div>

    <BaseEmptyState
      v-if="hasLoadError"
      icon="pi pi-exclamation-circle"
      title="Couldn't load pizzas"
      description="Please check your connection and try again."
    >
      <template #actions>
        <BaseButton variant="secondary" label="Try again" @click="pizzasQuery.refetch()" />
      </template>
    </BaseEmptyState>

    <template v-else>
      <AdminTable :rows="pizzas" data-key="id" :loading="pizzasQuery.isPending.value">
        <Column header="Pizza">
          <template #body="{ data }: { data: Pizza }">
            <div class="flex items-center gap-3" data-test="pizza-row">
              <img
                :src="toMediaUrl(data.image)"
                alt=""
                class="size-12 shrink-0 rounded-lg bg-card-subtle object-cover"
              />
              <div class="flex min-w-0 flex-col">
                <span class="font-medium text-foreground" data-test="pizza-name">
                  {{ data.name }}
                </span>
                <span class="line-clamp-1 max-w-sm text-caption">{{ data.description }}</span>
              </div>
            </div>
          </template>
        </Column>
        <Column header="Ingredients">
          <template #body="{ data }: { data: Pizza }">
            <span
              class="block max-w-xs truncate text-muted-foreground"
              :title="ingredientList(data)"
              data-test="pizza-ingredients"
            >
              {{ ingredientList(data) || "—" }}
            </span>
          </template>
        </Column>
        <Column header="Price">
          <template #body="{ data }: { data: Pizza }">
            <span class="font-semibold whitespace-nowrap">{{ formatPrice(data.price) }}</span>
          </template>
        </Column>
        <Column header="Actions" :pt="{ columnHeaderContent: { class: 'justify-end' } }">
          <template #body="{ data }: { data: Pizza }">
            <TableActionButtons
              :item-label="data.name"
              @edit="goToEditPizza(data)"
              @delete="confirmDelete(data)"
            />
          </template>
        </Column>
        <template #empty>
          <BaseEmptyState
            v-if="search"
            icon="pi pi-search"
            :title="`No pizzas match “${search}”`"
            description="Try a different search term."
          >
            <template #actions>
              <BaseButton variant="secondary" label="Clear search" @click="clearSearch" />
            </template>
          </BaseEmptyState>
          <BaseEmptyState
            v-else
            icon="pi pi-box"
            title="No pizzas yet"
            description="Add your first pizza to the menu."
          />
        </template>
      </AdminTable>

      <BasePagination v-model:page="page" :total-pages="totalPages" />
    </template>
  </section>
</template>
