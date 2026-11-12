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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import * as authApi from "@/api/auth";
import * as cartApi from "@/api/cart";
import * as ordersApi from "@/api/orders";
import { CART_QUERY_KEY } from "@/composables/useCart";
import { CART_CLEAR_REFETCH_DELAY_MS } from "@/composables/useCreateOrder";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { Cart, CartItem } from "@/types/cart.types";
import type { Order } from "@/types/order.types";
import { DiscountMode } from "@/types/promocode.types";
import type { User } from "@/types/user.types";
import CheckoutView from "@/views/CheckoutView.vue";

vi.mock("@/api/cart", () => ({ getCart: vi.fn() }));
vi.mock("@/api/orders", () => ({ createOrder: vi.fn(), listMyOrders: vi.fn() }));
vi.mock("@/api/auth", () => ({ me: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }));

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
);

const USER = { id: "u1", role: "user", email: "a@b.c", isEmailVerified: true } as User;

const item = (pizzaId: string, name: string, price: number, quantity: number): CartItem => ({
  id: `item-${pizzaId}`,
  pizza: { id: pizzaId, name, price, image: null },
  quantity,
});

const CART: Cart = {
  id: "c1",
  cartItems: [item("p1", "Margherita", 12.5, 2), item("p2", "Diavola", 15, 1)],
  promocode: {
    id: "pr1",
    code: "WELCOME20",
    discount: 20,
    discountMode: DiscountMode.PERCENTAGE,
    validTill: "2030-01-01T00:00:00.000Z",
  },
  totalPrice: 40,
  discountAmount: 8,
  finalPrice: 32,
  createdAt: "",
  updatedAt: "",
};

const ORDER_ID = "22222222-2222-4222-8222-222222222222";

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
  useAuthStore().setUser(USER);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/checkout");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  wrapper = mount(CheckoutView, {
    attachTo: document.body,
    global: { plugins: [pinia, router, PrimeVue, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return { wrapper, router, queryClient };
}

const placeOrder = async (target: VueWrapper) => {
  await target.get("form").trigger("submit");
  await flushPromises();
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(cartApi.getCart).mockResolvedValue(CART);
  vi.mocked(ordersApi.createOrder).mockResolvedValue({ id: ORDER_ID } as Order);
});

afterEach(() => {
  vi.useRealTimers();
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("CheckoutView", () => {
  it("shows the items, totals and the place-order button with the final price", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get("h1").text()).toBe("Checkout");
    expect(wrapper.findAll("[data-test='checkout-item']").map((row) => row.text())).toEqual([
      "Margherita ×2$25.00",
      "Diavola ×1$15.00",
    ]);
    expect(wrapper.get("[data-test='summary-discount']").text()).toBe(
      "Discount (WELCOME20)−$8.00"
    );
    expect(wrapper.get("button[type='submit']").text()).toBe("Place order · $32.00");
    expect(wrapper.text()).toContain("By placing your order you agree to our terms of service.");
    expect(wrapper.get("a[aria-label='Back to cart']").attributes("href")).toBe("/cart");
  });

  it("redirects to the cart when the cart is empty", async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue({ ...CART, cartItems: [] });
    const { router } = await setup();

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("cart");
    });
  });

  it("shows the address only for delivery and switches the instructions label", async () => {
    const { wrapper } = await setup();

    expect(wrapper.find("#checkout-address").exists()).toBe(true);
    expect(wrapper.text()).toContain("Delivery instructions (optional)");

    await wrapper.get("input[value='pickup']").setValue(true);

    expect(wrapper.find("#checkout-address").exists()).toBe(false);
    expect(wrapper.text()).toContain("Notes for pickup (optional)");
  });

  it("requires an address for delivery and focuses it", async () => {
    const { wrapper } = await setup();

    await placeOrder(wrapper);

    expect(wrapper.get("#checkout-address-message").text()).toBe(
      "Address is required for delivery"
    );
    expect(document.activeElement?.id).toBe("checkout-address");
    expect(ordersApi.createOrder).not.toHaveBeenCalled();
  });

  it("places a delivery order and opens it with the placed banner", async () => {
    const { wrapper, router, queryClient } = await setup();

    await wrapper.get("#checkout-address").setValue(" 1 Pizza Street ");
    await wrapper.get("#checkout-comment").setValue("Ring twice");
    await wrapper.get("input[value='cash']").setValue(true);
    await placeOrder(wrapper);

    expect(ordersApi.createOrder).toHaveBeenCalledWith({
      delivery: "delivery",
      paymentMethod: "cash",
      address: "1 Pizza Street",
      comment: "Ring twice",
    });
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("my-order-details");
    });
    expect(router.currentRoute.value.params.id).toBe(ORDER_ID);
    expect(router.currentRoute.value.query.placed).toBe("1");
    expect(queryClient.getQueryData<Cart>(CART_QUERY_KEY)?.cartItems).toEqual([]);
  });

  it("places a pickup order without an address", async () => {
    const { wrapper } = await setup();

    await wrapper.get("input[value='pickup']").setValue(true);
    await placeOrder(wrapper);

    expect(ordersApi.createOrder).toHaveBeenCalledWith({
      delivery: "pickup",
      paymentMethod: "card_online",
      comment: null,
    });
  });

  it("invalidates my orders now and refetches the cart once the server cleared it", async () => {
    const { wrapper, queryClient } = await setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    vi.useFakeTimers();

    await wrapper.get("input[value='pickup']").setValue(true);
    await wrapper.get("form").trigger("submit");
    await vi.advanceTimersByTimeAsync(0);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["orders", "my"] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: CART_QUERY_KEY });

    await vi.advanceTimersByTimeAsync(CART_CLEAR_REFETCH_DELAY_MS);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: CART_QUERY_KEY });
  });

  it("does not submit twice while the order is being placed", async () => {
    vi.mocked(ordersApi.createOrder).mockReturnValue(new Promise(() => undefined));
    const { wrapper } = await setup();

    await wrapper.get("input[value='pickup']").setValue(true);
    await wrapper.get("form").trigger("submit");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(ordersApi.createOrder).toHaveBeenCalledOnce();
    expect(wrapper.get("button[type='submit']").attributes()).toHaveProperty("disabled");
  });

  it("shows the verification banner inline on 403 and hides it once verified", async () => {
    vi.mocked(ordersApi.createOrder).mockRejectedValue(
      httpError(403, {
        statusCode: 403,
        message: "Email is not verified. Please verify your email first.",
      })
    );
    const { wrapper, router } = await setup();
    useAuthStore().setUser({ ...USER, isEmailVerified: false });

    await wrapper.get("input[value='pickup']").setValue(true);
    await placeOrder(wrapper);

    const banner = wrapper.get("[data-test='email-verification-banner']");
    expect(banner.text()).toContain("Verify your email to place orders.");
    expect(router.currentRoute.value.name).toBe("checkout");
    expect(toastAdd).not.toHaveBeenCalled();

    vi.mocked(authApi.me).mockResolvedValue(USER);
    await banner.get("button").trigger("click");
    await flushPromises();

    expect(wrapper.find("[data-test='email-verification-banner']").exists()).toBe(false);
  });

  it("shows an unavailable-pizza error with a link back to the cart", async () => {
    vi.mocked(ordersApi.createOrder).mockRejectedValue(
      httpError(400, { statusCode: 400, message: 'Pizza "p2" is no longer available' })
    );
    const { wrapper } = await setup();

    await wrapper.get("input[value='pickup']").setValue(true);
    await placeOrder(wrapper);

    const alert = wrapper.get("[data-test='order-error']");
    expect(alert.text()).toContain('Pizza "p2" is no longer available');
    expect(alert.get("a").attributes("href")).toBe("/cart");
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", detail: 'Pizza "p2" is no longer available' })
    );
    expect(wrapper.get("button[type='submit']").attributes()).not.toHaveProperty("disabled");
  });

  it("puts server field errors on the matching field", async () => {
    vi.mocked(ordersApi.createOrder).mockRejectedValue(
      httpError(400, {
        formErrors: [],
        fieldErrors: { address: ["Address must be at most 255 characters"] },
      })
    );
    const { wrapper } = await setup();

    await wrapper.get("#checkout-address").setValue("1 Pizza Street");
    await placeOrder(wrapper);

    expect(wrapper.get("#checkout-address-message").text()).toBe(
      "Address must be at most 255 characters"
    );
    expect(wrapper.find("[data-test='order-error']").exists()).toBe(false);
  });
});
