<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, nextTick, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";

import { getErrorMessage, isEmailNotVerifiedError } from "@/api/errors";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import OrderSummaryCard from "@/components/cart/OrderSummaryCard.vue";
import DeliveryAddressField from "@/components/checkout/DeliveryAddressField.vue";
import DeliveryInstructionsField from "@/components/checkout/DeliveryInstructionsField.vue";
import DeliveryMethodPicker from "@/components/checkout/DeliveryMethodPicker.vue";
import PaymentMethodPicker from "@/components/checkout/PaymentMethodPicker.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useCart } from "@/composables/useCart";
import { useCheckoutForm } from "@/composables/useCheckoutForm";
import { useCreateOrder } from "@/composables/useCreateOrder";
import { useRefreshSession } from "@/composables/useRefreshSession";
import { useAuthStore } from "@/stores/auth";
import { DeliveryType } from "@/types/order.types";
import { formatPrice } from "@/utils/format";

const FIELD_INPUT_IDS: Partial<Record<string, string>> = {
  address: "checkout-address",
  comment: "checkout-comment",
};

const router = useRouter();
const { isEmailVerified } = storeToRefs(useAuthStore());
const { showError } = useAppToast();
const { isRefreshing, refreshSession } = useRefreshSession();

const { data: cart } = useCart();
const checkout = useCheckoutForm();
const createOrder = useCreateOrder();

const isSubmitting = ref(false);
const emailNotVerified = ref(false);
const orderError = ref<string | null>(null);

const items = computed(() => cart.value?.cartItems.filter((item) => item.pizza !== null) ?? []);
const isDelivery = computed(() => checkout.form.delivery === DeliveryType.DELIVERY);
const placeOrderLabel = computed(() =>
  cart.value ? `Place order · ${formatPrice(cart.value.finalPrice)}` : "Place order"
);
const showVerificationBanner = computed(() => emailNotVerified.value && !isEmailVerified.value);

watch(
  cart,
  (current) => {
    if (current?.cartItems.length === 0 && !isSubmitting.value) {
      void router.replace({ name: "cart" });
    }
  },
  { immediate: true }
);

watch(
  () => [checkout.form.delivery, checkout.form.paymentMethod, checkout.form.address],
  () => {
    orderError.value = null;
  }
);

async function focusFirstInvalidField(): Promise<void> {
  await nextTick();
  const field = checkout.firstInvalidField.value;
  const inputId = field ? FIELD_INPUT_IDS[field] : undefined;
  if (inputId) {
    document.getElementById(inputId)?.focus();
  }
}

async function placeOrder(): Promise<void> {
  if (isSubmitting.value) {
    return;
  }
  isSubmitting.value = true;
  emailNotVerified.value = false;
  orderError.value = null;
  try {
    if (!(await checkout.validate())) {
      isSubmitting.value = false;
      await focusFirstInvalidField();
      return;
    }
    const order = await createOrder.mutateAsync(checkout.toPayload());
    await router.push({
      name: "my-order-details",
      params: { id: order.id },
      query: { placed: "1" },
    });
  } catch (error) {
    isSubmitting.value = false;
    handleOrderError(error);
  }
}

function handleOrderError(error: unknown): void {
  if (isEmailNotVerifiedError(error)) {
    emailNotVerified.value = true;
    return;
  }
  checkout.applyServerError(error);
  if (checkout.firstInvalidField.value) {
    void focusFirstInvalidField();
    return;
  }
  orderError.value = getErrorMessage(error);
  showError(error, "Couldn't place your order");
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex items-center gap-3">
      <RouterLink
        :to="{ name: 'cart' }"
        aria-label="Back to cart"
        class="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <i class="pi pi-arrow-left" aria-hidden="true" />
      </RouterLink>
      <h1 class="text-page-title">Checkout</h1>
    </header>

    <EmailVerificationBanner
      v-if="showVerificationBanner"
      class="rounded-control"
      :loading="isRefreshing"
      @refresh="refreshSession"
    />

    <div
      v-if="orderError"
      class="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-control bg-primary/10 px-3 py-2.5 text-sm text-primary"
      role="alert"
      data-test="order-error"
    >
      <i class="pi pi-exclamation-circle" aria-hidden="true" />
      <span>{{ orderError }}</span>
      <RouterLink :to="{ name: 'cart' }" class="font-semibold underline underline-offset-2">
        Review your cart
      </RouterLink>
    </div>

    <form
      v-if="cart"
      class="grid items-start gap-6 lg:grid-cols-[1fr_360px]"
      novalidate
      @submit.prevent="placeOrder"
    >
      <BaseCard>
        <DeliveryMethodPicker v-model="checkout.form.delivery" />
        <DeliveryAddressField
          v-if="isDelivery"
          v-model="checkout.form.address"
          :error="checkout.errors.value.address"
          @blur="checkout.touch('address')"
        />
        <DeliveryInstructionsField
          v-model="checkout.form.comment"
          :delivery="checkout.form.delivery"
          :error="checkout.errors.value.comment"
          @blur="checkout.touch('comment')"
        />
        <PaymentMethodPicker
          v-model="checkout.form.paymentMethod"
          :error="checkout.errors.value.paymentMethod"
        />
      </BaseCard>

      <OrderSummaryCard
        :total-price="cart.totalPrice"
        :discount-amount="cart.discountAmount"
        :final-price="cart.finalPrice"
        :promo-code="cart.promocode?.code"
      >
        <ul class="flex flex-col gap-2 border-b border-border pb-4 text-sm">
          <li
            v-for="item in items"
            :key="item.id"
            class="flex justify-between gap-3"
            data-test="checkout-item"
          >
            <span class="min-w-0 truncate">{{ item.pizza?.name }} ×{{ item.quantity }}</span>
            <span class="shrink-0 font-medium">
              {{ formatPrice((item.pizza?.price ?? 0) * item.quantity) }}
            </span>
          </li>
        </ul>
        <template #actions>
          <BaseButton
            type="submit"
            size="lg"
            block
            :label="placeOrderLabel"
            :loading="isSubmitting"
          />
          <p class="text-center text-caption">
            By placing your order you agree to our terms of service.
          </p>
        </template>
      </OrderSummaryCard>
    </form>
  </section>
</template>
