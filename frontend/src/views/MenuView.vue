<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import MenuSearchBar from "@/components/pizza/MenuSearchBar.vue";
import PizzaGrid from "@/components/pizza/PizzaGrid.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useAddToCart, useCart } from "@/composables/useCart";
import { useMenuFilters } from "@/composables/useMenuFilters";
import { MENU_PAGE_SIZE, usePizzas } from "@/composables/usePizzas";
import { useAuthStore } from "@/stores/auth";
import type { Pizza } from "@/types/pizza.types";

const route = useRoute();
const router = useRouter();
const { isAuthenticated } = storeToRefs(useAuthStore());
const { showSuccess, showError } = useAppToast();

const { searchInput, search, page, clearSearch } = useMenuFilters();

const pizzasQuery = usePizzas(() => ({
  page: page.value,
  limit: MENU_PAGE_SIZE,
  search: search.value,
}));
const catalogQuery = usePizzas({ page: 1, limit: 1 });

const pizzas = computed(() => pizzasQuery.data.value?.data ?? []);
const total = computed(() => pizzasQuery.data.value?.total ?? 0);
const totalPages = computed(() => pizzasQuery.data.value?.totalPages ?? 0);
const catalogTotal = computed(() => catalogQuery.data.value?.total);
const isInitialLoading = computed(() => pizzasQuery.isPending.value);
const isEmpty = computed(() => pizzasQuery.isSuccess.value && pizzas.value.length === 0);
const resultsCaption = computed(
  () => `${String(total.value)} ${total.value === 1 ? "result" : "results"} for “${search.value}”`
);

const { data: cart } = useCart();
const addToCart = useAddToCart();
const addingPizzaIds = reactive(new Set<string>());

const cartQuantities = computed(() =>
  Object.fromEntries(
    (cart.value?.cartItems ?? []).flatMap((item) =>
      item.pizza ? [[item.pizza.id, item.quantity] as const] : []
    )
  )
);

async function handleAddToCart(pizza: Pizza): Promise<void> {
  if (!isAuthenticated.value) {
    await router.push({ name: "sign-in", query: { redirect: route.fullPath } });
    return;
  }
  if (addingPizzaIds.has(pizza.id)) {
    return;
  }
  addingPizzaIds.add(pizza.id);
  try {
    await addToCart.mutateAsync({ pizzaId: pizza.id, quantity: 1 });
    showSuccess(`Added ${pizza.name}`);
  } catch (error) {
    showError(error, "Couldn't add to cart");
  } finally {
    addingPizzaIds.delete(pizza.id);
  }
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-page-title">Our Menu</h1>
      <p v-if="catalogTotal !== undefined" class="text-muted-foreground" data-test="menu-subtitle">
        {{ catalogTotal }} artisan pizzas, handcrafted fresh every day.
      </p>
    </header>

    <div class="flex flex-col gap-2 sm:max-w-md">
      <MenuSearchBar v-model="searchInput" />
      <p v-if="search && pizzasQuery.isSuccess.value" class="text-caption" data-test="search-caption">
        {{ resultsCaption }}
      </p>
    </div>

    <BaseEmptyState
      v-if="pizzasQuery.isError.value && !pizzasQuery.data.value"
      icon="pi pi-exclamation-circle"
      title="Couldn't load the menu"
      description="Please check your connection and try again."
    >
      <template #actions>
        <BaseButton variant="secondary" label="Try again" @click="pizzasQuery.refetch()" />
      </template>
    </BaseEmptyState>

    <BaseEmptyState
      v-else-if="isEmpty && search"
      icon="pi pi-search"
      title="No pizzas found"
      description="Try a different search term."
    >
      <template #actions>
        <BaseButton variant="secondary" label="Clear search" @click="clearSearch" />
      </template>
    </BaseEmptyState>

    <BaseEmptyState
      v-else-if="isEmpty"
      icon="pi pi-inbox"
      title="No pizzas yet"
      description="Our menu is being prepared. Check back soon."
    />

    <template v-else>
      <PizzaGrid
        :pizzas="pizzas"
        :loading="isInitialLoading"
        :skeleton-count="MENU_PAGE_SIZE"
        :cart-quantities="cartQuantities"
        :adding-pizza-ids="addingPizzaIds"
        @add-to-cart="handleAddToCart"
      />
      <BasePagination v-model:page="page" :total-pages="totalPages" />
    </template>
  </section>
</template>
