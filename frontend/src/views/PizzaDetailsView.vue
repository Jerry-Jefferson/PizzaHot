<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { type RouteLocationRaw, useRoute, useRouter } from "vue-router";

import { getErrorStatus } from "@/api/errors";
import BaseBackLink from "@/components/base/BaseBackLink.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import IngredientChips from "@/components/pizza/IngredientChips.vue";
import PizzaDetailsImage from "@/components/pizza/PizzaDetailsImage.vue";
import PizzaDetailsInfo from "@/components/pizza/PizzaDetailsInfo.vue";
import PizzaDetailsSkeleton from "@/components/pizza/PizzaDetailsSkeleton.vue";
import PizzaOrderPanel from "@/components/pizza/PizzaOrderPanel.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useAddToCart, useCart } from "@/composables/useCart";
import { usePizza } from "@/composables/usePizzas";
import { useAuthStore } from "@/stores/auth";

type PendingAction = "add" | "order";

const NOT_FOUND_STATUSES = new Set([400, 404]);

const route = useRoute();
const router = useRouter();
const { isAuthenticated } = storeToRefs(useAuthStore());
const { showSuccess, showError } = useAppToast();

const pizzaId = computed(() => String(route.params.id));
const { data: pizza, isPending, error } = usePizza(pizzaId);
const { data: cart } = useCart();
const addToCart = useAddToCart();

const quantity = ref(1);
const pendingAction = ref<PendingAction | null>(null);

const isNotFound = computed(() => NOT_FOUND_STATUSES.has(getErrorStatus(error.value) ?? 0));
const inCart = computed(
  () => cart.value?.cartItems.find((item) => item.pizza?.id === pizzaId.value)?.quantity ?? 0
);

const menuLink = computed<RouteLocationRaw>(() => {
  const back: unknown = router.options.history.state.back;
  if (typeof back === "string" && router.resolve(back).name === "menu") {
    return back;
  }
  return { name: "menu" };
});

const originalTitle = document.title;
watch(
  () => pizza.value?.name,
  (name) => {
    document.title = name ?? originalTitle;
  },
  { immediate: true }
);
onBeforeUnmount(() => {
  document.title = originalTitle;
});

watch(pizzaId, () => {
  quantity.value = 1;
});

async function submit(action: PendingAction): Promise<void> {
  const currentPizza = pizza.value;
  if (!currentPizza || pendingAction.value) {
    return;
  }
  if (!isAuthenticated.value) {
    await router.push({ name: "sign-in", query: { redirect: route.fullPath } });
    return;
  }
  pendingAction.value = action;
  const addedQuantity = quantity.value;
  try {
    await addToCart.mutateAsync({ pizzaId: currentPizza.id, quantity: addedQuantity });
    quantity.value = 1;
    if (action === "order") {
      await router.push({ name: "checkout" });
    } else {
      showSuccess(`${currentPizza.name} ×${String(addedQuantity)} added to cart`);
    }
  } catch (submitError) {
    showError(submitError, "Couldn't add to cart");
  } finally {
    pendingAction.value = null;
  }
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <BaseBackLink :to="menuLink" label="Back to menu" />

    <PizzaDetailsSkeleton v-if="isPending" />

    <BaseEmptyState
      v-else-if="isNotFound"
      icon="pi pi-search"
      title="This pizza is no longer on the menu"
      description="It may have been removed. Take a look at what else we have."
    >
      <template #actions>
        <BaseButton
          variant="secondary"
          icon="pi pi-arrow-left"
          label="Back to menu"
          @click="router.push(menuLink)"
        />
      </template>
    </BaseEmptyState>

    <BaseEmptyState
      v-else-if="!pizza"
      icon="pi pi-exclamation-circle"
      title="Couldn't load this pizza"
      description="Please check your connection and try again."
    />

    <div v-else class="grid gap-10 lg:grid-cols-2">
      <PizzaDetailsImage :image="pizza.image" :alt="pizza.name" />
      <div class="flex flex-col gap-6">
        <PizzaDetailsInfo :name="pizza.name" :description="pizza.description" />
        <IngredientChips :ingredients="pizza.ingredients ?? []" />
        <PizzaOrderPanel
          v-model:quantity="quantity"
          :price="pizza.price"
          :in-cart="inCart"
          :pending-action="pendingAction"
          @add-to-cart="submit('add')"
          @order-now="submit('order')"
        />
      </div>
    </div>
  </section>
</template>
