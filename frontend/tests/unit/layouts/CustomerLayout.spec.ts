import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import * as authApi from "@/api/auth";
import * as cartApi from "@/api/cart";
import CustomerLayout from "@/layouts/CustomerLayout.vue";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { Cart } from "@/types/cart.types";
import { Role, type User } from "@/types/user.types";

vi.mock("@/api/auth", () => ({ me: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }));
vi.mock("@/api/cart", () => ({ getCart: vi.fn() }));

const cartItem = (pizzaId: string, quantity: number) => ({
  id: `item-${pizzaId}`,
  pizza: { id: pizzaId, name: pizzaId, price: 10, image: null },
  quantity,
});
const cartWith = (...cartItems: Cart["cartItems"]) => ({ cartItems }) as Cart;

const user = (isEmailVerified: boolean) =>
  ({ id: "u1", role: "user", email: "mario@x.io", name: "Mario", isEmailVerified }) as User;

async function setup(signedIn: User | null) {
  const pinia = createPinia();
  setActivePinia(pinia);
  if (signedIn) {
    useAuthStore().setUser(signedIn);
  }
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/");
  return mount(CustomerLayout, {
    slots: { default: "<p>Page</p>" },
    global: {
      plugins: [
        pinia,
        router,
        PrimeVue,
        ToastService,
        [VueQueryPlugin, { queryClient: new QueryClient() }],
      ],
    },
  });
}

const banner = "[data-test='email-verification-banner']";

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(cartApi.getCart).mockResolvedValue(cartWith());
});

describe("CustomerLayout", () => {
  it("renders the page inside the header and footer", async () => {
    const wrapper = await setup(null);

    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.get("main").text()).toBe("Page");
    expect(wrapper.find("footer").exists()).toBe(true);
  });

  it.each([
    ["a guest", null],
    ["a verified user", user(true)],
  ])("hides the verification banner for %s", async (_label, signedIn) => {
    expect((await setup(signedIn)).find(banner).exists()).toBe(false);
  });

  it("shows the banner to an unverified user and hides it once verified", async () => {
    vi.mocked(authApi.me).mockResolvedValue(user(true));
    const wrapper = await setup(user(false));

    await wrapper.get(`${banner} button`).trigger("click");
    await flushPromises();

    expect(authApi.me).toHaveBeenCalledOnce();
    expect(wrapper.find(banner).exists()).toBe(false);
  });

  it("shows the signed-in user in the header", async () => {
    const wrapper = await setup(user(true));

    expect(wrapper.find("[aria-label='Sign out']").exists()).toBe(true);
  });

  it("shows the cart item count in the header badge", async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith(cartItem("p1", 2), cartItem("p2", 3)));
    const wrapper = await setup(user(true));
    await flushPromises();

    expect(wrapper.get("[data-test='cart-count']").text()).toBe("5");
  });

  it.each([
    ["an empty cart", user(true)],
    ["a guest", null],
  ])("hides the cart badge for %s", async (_label, signedIn) => {
    const wrapper = await setup(signedIn);
    await flushPromises();

    expect(wrapper.find("[data-test='cart-count']").exists()).toBe(false);
    expect(cartApi.getCart).toHaveBeenCalledTimes(signedIn ? 1 : 0);
  });

  it.each([
    ["shows", { ...user(true), role: Role.ADMIN }, true],
    ["hides", user(true), false],
  ])("%s the admin panel link by role", async (_label, signedIn, visible) => {
    const wrapper = await setup(signedIn);

    expect(wrapper.find("[data-test='admin-panel-link']").exists()).toBe(visible);
  });
});
