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

import * as cartApi from "@/api/cart";
import * as pizzasApi from "@/api/pizzas";
import { SEARCH_DEBOUNCE_MS } from "@/composables/useMenuFilters";
import { MENU_PAGE_SIZE } from "@/composables/usePizzas";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { Paginated } from "@/types/api.types";
import type { Cart } from "@/types/cart.types";
import type { Pizza, PizzaListQuery } from "@/types/pizza.types";
import type { User } from "@/types/user.types";
import MenuView from "@/views/MenuView.vue";

vi.mock("@/api/pizzas", () => ({ listPizzas: vi.fn(), getPizza: vi.fn() }));
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

const pizza = (id: string, name: string): Pizza => ({
  id,
  name,
  description: `${name} description`,
  image: null,
  price: 10,
  ingredients: [],
  createdAt: "",
  updatedAt: "",
});

const CATALOG = [pizza("p1", "Margherita"), pizza("p2", "Diavola"), pizza("p3", "Capricciosa")];

const pageOf = (pizzas: Pizza[], { page = 1, totalPages = 1 } = {}): Paginated<Pizza> => ({
  data: pizzas,
  page,
  limit: MENU_PAGE_SIZE,
  total: pizzas.length,
  totalPages,
});

const EMPTY_CART: Cart = {
  id: "c1",
  cartItems: [],
  promocode: null,
  totalPrice: 0,
  discountAmount: 0,
  finalPrice: 0,
  createdAt: "",
  updatedAt: "",
};

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const badRequest = new AxiosError("Bad", "ERR_BAD_REQUEST", config, null, {
  data: { statusCode: 400, message: "Quantity cannot exceed 50 (current: 50)" },
  status: 400,
  statusText: "",
  headers: {} as RawAxiosResponseHeaders,
  config,
});

function respondWithCatalog(totalPages = 1) {
  vi.mocked(pizzasApi.listPizzas).mockImplementation((query: PizzaListQuery = {}) => {
    const term = query.search?.toLowerCase() ?? "";
    const matches = CATALOG.filter((item) => item.name.toLowerCase().includes(term));
    return Promise.resolve(pageOf(matches, { page: query.page, totalPages }));
  });
}

let wrapper: VueWrapper | undefined;

async function setup(path = "/", { signedIn = true } = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  if (signedIn) {
    useAuthStore().setUser({ id: "u1", role: "user", email: "a@b.c" } as User);
  }
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  wrapper = mount(MenuView, {
    global: { plugins: [pinia, router, PrimeVue, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return { wrapper, router };
}

const cardTitles = (target: VueWrapper) => target.findAll("article h3").map((h) => h.text());
const addButton = (target: VueWrapper, name: string) =>
  target.get(`button[aria-label='Add ${name} to cart']`);

beforeEach(() => {
  vi.resetAllMocks();
  respondWithCatalog();
  vi.mocked(cartApi.getCart).mockResolvedValue(EMPTY_CART);
});

afterEach(() => {
  vi.useRealTimers();
  wrapper?.unmount();
  wrapper = undefined;
});

describe("MenuView", () => {
  it("shows the heading, catalog size and pizza cards", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get("h1").text()).toBe("Our Menu");
    expect(wrapper.get("[data-test='menu-subtitle']").text()).toBe(
      "3 artisan pizzas, handcrafted fresh every day."
    );
    expect(cardTitles(wrapper)).toEqual(["Margherita", "Diavola", "Capricciosa"]);
    expect(pizzasApi.listPizzas).toHaveBeenCalledWith({
      page: 1,
      limit: MENU_PAGE_SIZE,
      search: "",
    });
  });

  it("shows skeleton cards while the first page loads", async () => {
    vi.mocked(pizzasApi.listPizzas).mockReturnValue(new Promise(() => undefined));
    const { wrapper } = await setup();

    expect(wrapper.find("[aria-busy='true']").exists()).toBe(true);
    expect(wrapper.findAll("article")).toHaveLength(0);
  });

  it("reads search and page from the query string", async () => {
    const { wrapper } = await setup("/?search=marg&page=2");

    expect(pizzasApi.listPizzas).toHaveBeenCalledWith({
      page: 2,
      limit: MENU_PAGE_SIZE,
      search: "marg",
    });
    expect(wrapper.get<HTMLInputElement>("input[type='search']").element.value).toBe("marg");
    expect(wrapper.get("[data-test='search-caption']").text()).toBe("1 result for “marg”");
  });

  it("debounces the search, writes it to the query and resets the page", async () => {
    const { wrapper, router } = await setup("/?page=2");
    vi.useFakeTimers();

    await wrapper.get("input[type='search']").setValue("dia");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    expect(router.currentRoute.value.query.search).toBeUndefined();

    vi.advanceTimersByTime(1);
    vi.useRealTimers();
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ search: "dia" });
    expect(cardTitles(wrapper)).toEqual(["Diavola"]);
  });

  it("shows the empty search state and clears the search", async () => {
    const { wrapper, router } = await setup("/?search=hawaii");

    expect(wrapper.text()).toContain("No pizzas found");
    expect(wrapper.text()).toContain("Try a different search term.");
    expect(wrapper.find("[data-test='search-caption']").text()).toBe("0 results for “hawaii”");

    const clear = wrapper.findAll("button").find((button) => button.text() === "Clear search");
    await clear?.trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({});
    expect(wrapper.get<HTMLInputElement>("input[type='search']").element.value).toBe("");
    expect(cardTitles(wrapper)).toHaveLength(3);
  });

  it("paginates through the query string", async () => {
    respondWithCatalog(3);
    const { wrapper, router } = await setup();

    await wrapper.get("button[aria-label='Page 2']").trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ page: "2" });
    expect(pizzasApi.listPizzas).toHaveBeenLastCalledWith({
      page: 2,
      limit: MENU_PAGE_SIZE,
      search: "",
    });
  });

  it("hides pagination when there is only one page", async () => {
    const { wrapper } = await setup();

    expect(wrapper.find("nav[aria-label='Pagination']").exists()).toBe(false);
  });

  it("adds a pizza to the cart and shows how many are in it", async () => {
    vi.mocked(cartApi.addItem).mockResolvedValue({
      id: "i1",
      pizza: { id: "p2", name: "Diavola", price: 10, image: null },
      quantity: 1,
    });
    const { wrapper } = await setup();
    vi.mocked(cartApi.getCart).mockResolvedValue({
      ...EMPTY_CART,
      cartItems: [
        { id: "i1", pizza: { id: "p2", name: "Diavola", price: 10, image: null }, quantity: 1 },
      ],
    });

    await addButton(wrapper, "Diavola").trigger("click");
    await flushPromises();

    expect(cartApi.addItem).toHaveBeenCalledWith({ pizzaId: "p2", quantity: 1 });
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Added Diavola" })
    );
    expect(addButton(wrapper, "Diavola").text()).toContain("In cart · 1");
  });

  it("shows the backend error when adding fails", async () => {
    vi.mocked(cartApi.addItem).mockRejectedValue(badRequest);
    const { wrapper } = await setup();

    await addButton(wrapper, "Margherita").trigger("click");
    await flushPromises();

    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "Quantity cannot exceed 50 (current: 50)",
      })
    );
  });

  it("sends guests to sign-in instead of adding to the cart", async () => {
    const { wrapper, router } = await setup("/?page=1", { signedIn: false });

    await addButton(wrapper, "Margherita").trigger("click");
    await flushPromises();

    expect(cartApi.getCart).not.toHaveBeenCalled();
    expect(cartApi.addItem).not.toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("sign-in");
    });
    expect(router.currentRoute.value.query.redirect).toBe("/?page=1");
  });
});
