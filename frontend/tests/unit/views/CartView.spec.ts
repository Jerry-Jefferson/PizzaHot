import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import * as cartApi from "@/api/cart";
import BaseConfirmDialog from "@/components/base/BaseConfirmDialog.vue";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { Cart, CartItem } from "@/types/cart.types";
import { DiscountMode } from "@/types/promocode.types";
import type { User } from "@/types/user.types";
import CartView from "@/views/CartView.vue";

vi.mock("@/api/cart", () => ({
  getCart: vi.fn(),
  addItem: vi.fn(),
  updateItemQuantity: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
  applyPromocode: vi.fn(),
  removePromocode: vi.fn(),
}));
vi.mock("@/api/auth", () => ({ me: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }));

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
);

const item = (pizzaId: string, name: string, price: number, quantity: number): CartItem => ({
  id: `item-${pizzaId}`,
  pizza: { id: pizzaId, name, price, image: null },
  quantity,
});

const MARGHERITA = item("p1", "Margherita", 12.5, 2);
const DIAVOLA = item("p2", "Diavola", 15, 1);

const cartWith = (cartItems: CartItem[], overrides: Partial<Cart> = {}): Cart => {
  const totalPrice = cartItems.reduce(
    (sum, cartItem) => sum + (cartItem.pizza?.price ?? 0) * cartItem.quantity,
    0
  );
  return {
    id: "c1",
    cartItems,
    promocode: null,
    totalPrice,
    discountAmount: 0,
    finalPrice: totalPrice,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
};

const PROMO = {
  id: "pr1",
  code: "WELCOME20",
  discount: 20,
  discountMode: DiscountMode.PERCENTAGE,
  validTill: "2030-01-01T00:00:00.000Z",
};

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const httpError = (status: number, data: unknown) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data,
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

let wrapper: VueWrapper | undefined;

async function setup() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useAuthStore().setUser({ id: "u1", role: "user", email: "a@b.c" } as User);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/cart");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Host = defineComponent({ setup: () => () => [h(CartView), h(BaseConfirmDialog)] });
  wrapper = mount(Host, {
    attachTo: document.body,
    global: {
      plugins: [pinia, router, PrimeVue, ConfirmationService, [VueQueryPlugin, { queryClient }]],
    },
  });
  await flushPromises();
  return { wrapper, router };
}

const button = (target: VueWrapper, label: string) => {
  const found = target.findAll("button").find((candidate) => candidate.text() === label);
  if (!found) {
    throw new Error(`No button "${label}"`);
  }
  return found;
};
const promoInput = (target: VueWrapper) => target.get<HTMLInputElement>("#promo-code");
const rowTitles = (target: VueWrapper) => target.findAll("li h3").map((title) => title.text());

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(cartApi.getCart).mockResolvedValue(cartWith([MARGHERITA, DIAVOLA]));
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("CartView", () => {
  it("lists the items with prices, line totals, count and summary", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get("h1").text()).toBe("Your Cart");
    expect(wrapper.get("[data-test='cart-item-count']").text()).toBe("(3 items)");
    expect(rowTitles(wrapper)).toEqual(["Margherita", "Diavola"]);
    expect(wrapper.text()).toContain("$12.50 each");
    expect(wrapper.findAll("[data-test='line-total']").map((total) => total.text())).toEqual([
      "$25.00",
      "$15.00",
    ]);
    expect(wrapper.get("[data-test='summary-subtotal']").text()).toBe("$40.00");
    expect(wrapper.get("[data-test='summary-total']").text()).toBe("$40.00");
    expect(wrapper.get("a[aria-label='Back to menu']").attributes("href")).toBe("/");
    const checkout = wrapper.findAll("a").find((link) => link.text() === "Proceed to checkout");
    expect(checkout?.attributes("href")).toBe("/checkout");
  });

  it("shows the empty state without the summary", async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith([]));
    const { wrapper } = await setup();

    expect(wrapper.get("[data-test='empty-cart']").text()).toContain("Your cart is empty");
    expect(wrapper.find("[data-test='cart-item-count']").exists()).toBe(false);
    expect(wrapper.find("a[aria-label='Back to menu']").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Order Summary");
    const browse = wrapper.findAll("a").find((link) => link.text() === "Browse menu");
    expect(browse?.attributes("href")).toBe("/");
  });

  it("updates the quantity optimistically through the stepper", async () => {
    vi.mocked(cartApi.updateItemQuantity).mockReturnValue(new Promise(() => undefined));
    const { wrapper } = await setup();

    await wrapper
      .get("[aria-label='Quantity of Diavola'] button[aria-label='Increase quantity']")
      .trigger("click");
    await flushPromises();

    expect(cartApi.updateItemQuantity).toHaveBeenCalledWith({ pizzaId: "p2", quantity: 2 });
    expect(wrapper.findAll("[data-test='line-total']")[1]?.text()).toBe("$30.00");
  });

  it("removes the item when the stepper reaches 0 and refetches the cart", async () => {
    vi.mocked(cartApi.updateItemQuantity).mockResolvedValue(null);
    const { wrapper } = await setup();
    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith([MARGHERITA]));

    await wrapper
      .get("[aria-label='Quantity of Diavola'] button[aria-label='Decrease quantity']")
      .trigger("click");
    await flushPromises();

    expect(cartApi.updateItemQuantity).toHaveBeenCalledWith({ pizzaId: "p2", quantity: 0 });
    expect(cartApi.getCart).toHaveBeenCalledTimes(2);
    expect(rowTitles(wrapper)).toEqual(["Margherita"]);
  });

  it("rolls back and toasts when the quantity update fails", async () => {
    vi.mocked(cartApi.updateItemQuantity).mockRejectedValue(
      httpError(400, { statusCode: 400, message: "Quantity cannot exceed 50" })
    );
    const { wrapper } = await setup();

    await wrapper
      .get("[aria-label='Quantity of Diavola'] button[aria-label='Increase quantity']")
      .trigger("click");
    await flushPromises();

    expect(wrapper.findAll("[data-test='line-total']")[1]?.text()).toBe("$15.00");
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", detail: "Quantity cannot exceed 50" })
    );
  });

  it("removes an item with the trash button", async () => {
    vi.mocked(cartApi.removeItem).mockResolvedValue();
    const { wrapper } = await setup();
    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith([DIAVOLA]));

    await wrapper.get("button[aria-label='Remove Margherita']").trigger("click");
    await flushPromises();

    expect(cartApi.removeItem).toHaveBeenCalledWith("p1");
    expect(rowTitles(wrapper)).toEqual(["Diavola"]);
  });

  it("shows an unavailable pizza as a muted row that refreshes the cart on remove", async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue(
      cartWith([MARGHERITA, { id: "gone", pizza: null, quantity: 1 }])
    );
    const { wrapper } = await setup();

    expect(wrapper.get("[data-test='unavailable-item']").text()).toBe(
      "This pizza is no longer available"
    );
    expect(wrapper.findAll("[role='group']")).toHaveLength(1);

    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith([MARGHERITA]));
    await wrapper.get("button[aria-label='Remove unavailable pizza']").trigger("click");
    await flushPromises();

    expect(cartApi.removeItem).not.toHaveBeenCalled();
    expect(wrapper.find("[data-test='unavailable-item']").exists()).toBe(false);
  });

  describe("promo code", () => {
    it("keeps Apply disabled while the input is blank", async () => {
      const { wrapper } = await setup();

      expect(button(wrapper, "Apply").attributes()).toHaveProperty("disabled");
      await promoInput(wrapper).setValue("   ");
      expect(button(wrapper, "Apply").attributes()).toHaveProperty("disabled");
    });

    it("applies an upper-cased, trimmed code and shows the discount", async () => {
      vi.mocked(cartApi.applyPromocode).mockResolvedValue(
        cartWith([MARGHERITA, DIAVOLA], { promocode: PROMO, discountAmount: 8, finalPrice: 32 })
      );
      const { wrapper } = await setup();

      await promoInput(wrapper).setValue("  welcome20 ");
      await wrapper.get("form").trigger("submit");
      await flushPromises();

      expect(cartApi.applyPromocode).toHaveBeenCalledWith("WELCOME20");
      expect(promoInput(wrapper).element.value).toBe("WELCOME20");
      expect(promoInput(wrapper).attributes()).toHaveProperty("disabled");
      expect(wrapper.get("[data-test='summary-discount']").text()).toBe(
        "Discount (WELCOME20)−$8.00"
      );
      expect(wrapper.get("[data-test='summary-total']").text()).toBe("$32.00");
    });

    it("shows the backend error and clears it when the code is edited", async () => {
      vi.mocked(cartApi.applyPromocode).mockRejectedValue(
        httpError(404, { statusCode: 404, message: "Promocode not found" })
      );
      const { wrapper } = await setup();

      await promoInput(wrapper).setValue("NOPE");
      await wrapper.get("form").trigger("submit");
      await flushPromises();

      expect(wrapper.get("#promo-code-message").text()).toBe("Promocode not found");
      expect(promoInput(wrapper).attributes("aria-invalid")).toBe("true");

      await promoInput(wrapper).setValue("NOPE2");

      expect(wrapper.find("#promo-code-message").exists()).toBe(false);
    });

    it("falls back to a generic promo message for an unreadable error", async () => {
      vi.mocked(cartApi.applyPromocode).mockRejectedValue(httpError(500, "oops"));
      const { wrapper } = await setup();

      await promoInput(wrapper).setValue("NOPE");
      await wrapper.get("form").trigger("submit");
      await flushPromises();

      expect(wrapper.get("#promo-code-message").text()).toBe("Invalid or expired promo code.");
    });

    it("removes the applied code on Change and re-enables the input", async () => {
      vi.mocked(cartApi.getCart).mockResolvedValue(
        cartWith([MARGHERITA], { promocode: PROMO, discountAmount: 5, finalPrice: 20 })
      );
      vi.mocked(cartApi.removePromocode).mockResolvedValue(cartWith([MARGHERITA]));
      const { wrapper } = await setup();

      await button(wrapper, "Change").trigger("click");
      await flushPromises();

      expect(cartApi.removePromocode).toHaveBeenCalledOnce();
      expect(promoInput(wrapper).attributes()).not.toHaveProperty("disabled");
      expect(promoInput(wrapper).element.value).toBe("");
      expect(wrapper.find("[data-test='summary-discount']").exists()).toBe(false);
    });
  });

  describe("clear cart", () => {
    it("asks for confirmation and clears the cart", async () => {
      vi.mocked(cartApi.clearCart).mockResolvedValue();
      const { wrapper } = await setup();
      vi.mocked(cartApi.getCart).mockResolvedValue(cartWith([]));

      await button(wrapper, "Clear cart").trigger("click");
      await flushPromises();

      expect(document.body.textContent).toContain("Clear cart?");
      expect(cartApi.clearCart).not.toHaveBeenCalled();

      const confirm = [
        ...document.querySelectorAll<HTMLButtonElement>("[role='alertdialog'] button"),
      ].find((candidate) => candidate.textContent.trim() === "Clear cart");
      confirm?.click();
      await flushPromises();

      expect(cartApi.clearCart).toHaveBeenCalledOnce();
      expect(wrapper.find("[data-test='empty-cart']").exists()).toBe(true);
    });
  });
});
