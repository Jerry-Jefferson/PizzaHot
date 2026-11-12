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
import { createMemoryHistory, createRouter, createWebHistory } from "vue-router";

import * as cartApi from "@/api/cart";
import * as pizzasApi from "@/api/pizzas";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { Cart } from "@/types/cart.types";
import type { Pizza } from "@/types/pizza.types";
import type { User } from "@/types/user.types";
import PizzaDetailsView from "@/views/PizzaDetailsView.vue";

vi.mock("@/api/pizzas", () => ({ listPizzas: vi.fn(), getPizza: vi.fn() }));
vi.mock("@/api/cart", () => ({ getCart: vi.fn(), addItem: vi.fn() }));
vi.mock("@/api/auth", () => ({ me: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }));

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

const PIZZA_ID = "11111111-1111-4111-8111-111111111111";

const PIZZA: Pizza = {
  id: PIZZA_ID,
  name: "Margherita",
  description: "Tomato, mozzarella and basil",
  image: "/uploads/pizzas/margherita.webp",
  price: 12.5,
  ingredients: [
    { id: "i1", name: "Mozzarella", createdAt: "", updatedAt: "" },
    { id: "i2", name: "Basil", createdAt: "", updatedAt: "" },
  ],
  createdAt: "",
  updatedAt: "",
};

const CART_ITEM = {
  id: "ci1",
  pizza: { id: PIZZA_ID, name: "Margherita", price: 12.5, image: null },
  quantity: 1,
};

const cartWith = (quantity: number): Cart => ({
  id: "c1",
  cartItems: quantity > 0 ? [{ ...CART_ITEM, quantity }] : [],
  promocode: null,
  totalPrice: 0,
  discountAmount: 0,
  finalPrice: 0,
  createdAt: "",
  updatedAt: "",
});

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const httpError = (status: number, message: string) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data: { statusCode: status, message },
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

let wrapper: VueWrapper | undefined;

async function setup({
  signedIn = true,
  from,
  webHistory = false,
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
}: { signedIn?: boolean; from?: string; webHistory?: boolean; queryClient?: QueryClient } = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  if (signedIn) {
    useAuthStore().setUser({ id: "u1", role: "user", email: "a@b.c" } as User);
  }
  const router = createRouter({
    history: webHistory ? createWebHistory() : createMemoryHistory(),
    routes,
  });
  if (from) {
    await router.push(from);
  }
  await router.push(`/pizzas/${PIZZA_ID}`);
  wrapper = mount(PizzaDetailsView, {
    global: { plugins: [pinia, router, PrimeVue, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return { wrapper, router };
}

const button = (target: VueWrapper, label: string) => {
  const found = target.findAll("button").find((item) => item.text() === label);
  if (!found) {
    throw new Error(`No button "${label}"`);
  }
  return found;
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(pizzasApi.getPizza).mockResolvedValue(PIZZA);
  vi.mocked(cartApi.getCart).mockResolvedValue(cartWith(0));
  document.title = "Pizzeria";
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe("PizzaDetailsView", () => {
  it("shows the pizza with its image, ingredients, price and title", async () => {
    const { wrapper } = await setup();

    expect(pizzasApi.getPizza).toHaveBeenCalledWith(PIZZA_ID);
    expect(wrapper.get("h1").text()).toBe("Margherita");
    expect(wrapper.text()).toContain("Tomato, mozzarella and basil");
    expect(wrapper.findAll("li").map((chip) => chip.text())).toEqual(["Mozzarella", "Basil"]);
    expect(wrapper.get("img").attributes("src")).toBe("/uploads/pizzas/margherita.webp");
    expect(wrapper.get("[data-test='pizza-price']").text()).toBe("$12.50");
    expect(wrapper.get("[data-test='pizza-total']").text()).toBe("$12.50");
    expect(document.title).toBe("Margherita");
  });

  it("restores the document title when leaving", async () => {
    const { wrapper } = await setup();

    wrapper.unmount();

    expect(document.title).toBe("Pizzeria");
  });

  it("shows a placeholder when the pizza has no image", async () => {
    vi.mocked(pizzasApi.getPizza).mockResolvedValue({ ...PIZZA, image: null, ingredients: [] });
    const { wrapper } = await setup();

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find("[data-test='pizza-image-placeholder']").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Ingredients");
  });

  it("shows a skeleton while loading", async () => {
    vi.mocked(pizzasApi.getPizza).mockReturnValue(new Promise(() => undefined));
    const { wrapper } = await setup();

    expect(wrapper.find("[data-test='pizza-details-skeleton']").exists()).toBe(true);
  });

  it("uses the pizza from the menu cache without waiting for the request", async () => {
    vi.mocked(pizzasApi.getPizza).mockReturnValue(new Promise(() => undefined));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["pizzas", 1, 9, ""], {
      data: [PIZZA],
      page: 1,
      limit: 9,
      total: 1,
      totalPages: 1,
    });
    const { wrapper } = await setup({ queryClient });

    expect(wrapper.get("h1").text()).toBe("Margherita");
  });

  it("updates the total with the quantity", async () => {
    const { wrapper } = await setup();

    await wrapper.get("button[aria-label='Increase quantity']").trigger("click");
    await wrapper.get("button[aria-label='Increase quantity']").trigger("click");

    expect(wrapper.get("[data-test='pizza-total']").text()).toBe("$37.50");
  });

  it("adds the chosen quantity to the cart, toasts and resets the quantity", async () => {
    vi.mocked(cartApi.addItem).mockResolvedValue({ ...CART_ITEM, quantity: 2 });
    const { wrapper } = await setup();

    await wrapper.get("button[aria-label='Increase quantity']").trigger("click");
    await button(wrapper, "Add to cart").trigger("click");
    await flushPromises();

    expect(cartApi.addItem).toHaveBeenCalledWith({ pizzaId: PIZZA_ID, quantity: 2 });
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Margherita ×2 added to cart" })
    );
    expect(wrapper.get("output").text()).toBe("1");
  });

  it("adds to the cart and goes to checkout on Order now", async () => {
    vi.mocked(cartApi.addItem).mockResolvedValue(CART_ITEM);
    const { wrapper, router } = await setup();

    await button(wrapper, "Order now").trigger("click");
    await flushPromises();

    expect(cartApi.addItem).toHaveBeenCalledWith({ pizzaId: PIZZA_ID, quantity: 1 });
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("checkout");
    });
  });

  it("shows the backend error when adding fails", async () => {
    vi.mocked(cartApi.addItem).mockRejectedValue(httpError(400, "Pizza not found"));
    const { wrapper, router } = await setup();

    await button(wrapper, "Order now").trigger("click");
    await flushPromises();

    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", detail: "Pizza not found" })
    );
    expect(router.currentRoute.value.name).toBe("pizza-details");
  });

  it("shows what is already in the cart and warns above the 50 limit", async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith(49));
    const { wrapper } = await setup();

    expect(wrapper.get("[data-test='in-cart-caption']").text()).toBe("Already in cart: 49");
    expect(wrapper.find("[data-test='limit-warning']").exists()).toBe(false);

    await wrapper.get("button[aria-label='Increase quantity']").trigger("click");

    expect(wrapper.get("[data-test='limit-warning']").text()).toContain("up to 1 more");
    expect(button(wrapper, "Add to cart").attributes()).toHaveProperty("disabled");
    expect(button(wrapper, "Order now").attributes()).toHaveProperty("disabled");
  });

  it("sends guests to sign-in instead of adding", async () => {
    const { wrapper, router } = await setup({ signedIn: false });

    await button(wrapper, "Add to cart").trigger("click");
    await flushPromises();

    expect(cartApi.getCart).not.toHaveBeenCalled();
    expect(cartApi.addItem).not.toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("sign-in");
    });
    expect(router.currentRoute.value.query.redirect).toBe(`/pizzas/${PIZZA_ID}`);
  });

  it("shows the not-found state for a missing pizza", async () => {
    vi.mocked(pizzasApi.getPizza).mockRejectedValue(httpError(404, "Pizza not found"));
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("This pizza is no longer on the menu");
    expect(wrapper.find("h1").exists()).toBe(false);
  });

  it("links back to the menu keeping the previous search and page", async () => {
    const { wrapper } = await setup({ from: "/?search=marg&page=2", webHistory: true });

    expect(wrapper.get("a").attributes("href")).toBe("/?search=marg&page=2");
  });

  it("links back to the plain menu when opened directly", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get("a").attributes("href")).toBe("/");
  });
});
