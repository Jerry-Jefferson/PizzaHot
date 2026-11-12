<script setup lang="ts">
import { useQueryClient } from "@tanstack/vue-query";
import Skeleton from "primevue/skeleton";
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";

import { FALLBACK_ERROR_MESSAGE, getErrorMessage } from "@/api/errors";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import CartItemRow from "@/components/cart/CartItemRow.vue";
import EmptyCartState from "@/components/cart/EmptyCartState.vue";
import OrderSummaryCard from "@/components/cart/OrderSummaryCard.vue";
import PromoCodeField from "@/components/cart/PromoCodeField.vue";
import { useAppToast } from "@/composables/useAppToast";
import {
  CART_QUERY_KEY,
  useApplyPromocode,
  useCart,
  useCartItemCount,
  useClearCart,
  useRemoveCartItem,
  useRemovePromocode,
  useUpdateCartItem,
} from "@/composables/useCart";
import { useConfirmDanger } from "@/composables/useConfirmDanger";
import type { CartItem } from "@/types/cart.types";

const INVALID_PROMO_MESSAGE = "Invalid or expired promo code.";

const queryClient = useQueryClient();
const { showError } = useAppToast();
const confirmDanger = useConfirmDanger();

const cartQuery = useCart();
const itemCount = useCartItemCount();
const updateItem = useUpdateCartItem();
const removeItem = useRemoveCartItem();
const clearCart = useClearCart();
const applyPromocode = useApplyPromocode();
const removePromocode = useRemovePromocode();

const promoInput = ref("");
const promoError = ref<string | null>(null);

const cart = computed(() => cartQuery.data.value);
const items = computed(() => cart.value?.cartItems ?? []);
const isEmpty = computed(() => cart.value !== undefined && items.value.length === 0);
const itemCountCaption = computed(
  () => `(${String(itemCount.value)} ${itemCount.value === 1 ? "item" : "items"})`
);
const isPromoBusy = computed(
  () => applyPromocode.isPending.value || removePromocode.isPending.value
);

watch(promoInput, () => {
  promoError.value = null;
});

function promoErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  return message === FALLBACK_ERROR_MESSAGE ? INVALID_PROMO_MESSAGE : message;
}

function updateQuantity(item: CartItem, quantity: number): void {
  if (!item.pizza) {
    return;
  }
  updateItem.mutate(
    { pizzaId: item.pizza.id, quantity },
    {
      onError: (error) => {
        showError(error, "Couldn't update the quantity");
      },
    }
  );
}

async function remove(item: CartItem): Promise<void> {
  if (!item.pizza) {
    await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    return;
  }
  try {
    await removeItem.mutateAsync(item.pizza.id);
  } catch (error) {
    showError(error, "Couldn't remove the pizza");
  }
}

async function applyCode(): Promise<void> {
  const code = promoInput.value.trim().toUpperCase();
  if (!code || isPromoBusy.value) {
    return;
  }
  try {
    await applyPromocode.mutateAsync(code);
    promoInput.value = "";
  } catch (error) {
    promoError.value = promoErrorMessage(error);
  }
}

async function changeCode(): Promise<void> {
  if (isPromoBusy.value) {
    return;
  }
  try {
    await removePromocode.mutateAsync();
  } catch (error) {
    showError(error, "Couldn't remove the promo code");
  }
}

function confirmClearCart(): void {
  confirmDanger({
    title: "Clear cart?",
    message: "All pizzas will be removed from your cart.",
    confirmLabel: "Clear cart",
    onConfirm: () => clearCart.mutateAsync(),
  });
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <template v-if="isEmpty">
      <h1 class="text-page-title">Your Cart</h1>
      <EmptyCartState />
    </template>

    <template v-else>
      <header class="flex flex-wrap items-center gap-3">
        <RouterLink
          :to="{ name: 'menu' }"
          aria-label="Back to menu"
          class="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <i class="pi pi-arrow-left" aria-hidden="true" />
        </RouterLink>
        <h1 class="text-page-title">Your Cart</h1>
        <span v-if="cart" class="text-muted-foreground" data-test="cart-item-count">
          {{ itemCountCaption }}
        </span>
        <BaseButton
          v-if="cart"
          class="ml-auto"
          variant="ghost"
          size="sm"
          icon="pi pi-trash"
          label="Clear cart"
          :disabled="clearCart.isPending.value"
          @click="confirmClearCart"
        />
      </header>

      <BaseEmptyState
        v-if="cartQuery.isError.value && !cart"
        icon="pi pi-exclamation-circle"
        title="Couldn't load your cart"
        description="Please check your connection and try again."
      >
        <template #actions>
          <BaseButton variant="secondary" label="Try again" @click="cartQuery.refetch()" />
        </template>
      </BaseEmptyState>

      <div v-else class="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <BaseCard>
          <div v-if="!cart" class="flex flex-col gap-5" aria-hidden="true" data-test="cart-skeleton">
            <div v-for="index in 2" :key="index" class="flex gap-4">
              <Skeleton width="6rem" height="6rem" border-radius="0.75rem" />
              <div class="flex flex-1 flex-col gap-2">
                <Skeleton width="50%" height="1.5rem" />
                <Skeleton width="25%" height="1rem" />
                <Skeleton width="8rem" height="2.5rem" />
              </div>
            </div>
          </div>
          <ul v-else class="flex flex-col divide-y divide-border">
            <CartItemRow
              v-for="item in items"
              :key="item.id"
              :item="item"
              :disabled="clearCart.isPending.value"
              @update-quantity="updateQuantity(item, $event)"
              @remove="remove(item)"
            />
          </ul>
        </BaseCard>

        <OrderSummaryCard
          v-if="cart"
          :total-price="cart.totalPrice"
          :discount-amount="cart.discountAmount"
          :final-price="cart.finalPrice"
          :promo-code="cart.promocode?.code"
        >
          <PromoCodeField
            v-model="promoInput"
            :applied-code="cart.promocode?.code"
            :error="promoError"
            :loading="isPromoBusy"
            @apply="applyCode"
            @change="changeCode"
          />
          <template #actions>
            <RouterLink
              :to="{ name: 'checkout' }"
              class="inline-flex h-12 w-full items-center justify-center rounded-control bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Proceed to checkout
            </RouterLink>
            <RouterLink
              :to="{ name: 'menu' }"
              class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Continue shopping
            </RouterLink>
          </template>
        </OrderSummaryCard>
      </div>
    </template>
  </section>
</template>
