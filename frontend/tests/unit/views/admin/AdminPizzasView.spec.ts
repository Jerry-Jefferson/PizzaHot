import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import BaseConfirmDialog from "@/components/base/BaseConfirmDialog.vue";
import { SEARCH_DEBOUNCE_MS } from "@/composables/useMenuFilters";
import { routes } from "@/router/routes";
import * as pizzasApi from "@/services/api/pizzas";
import type { Paginated } from "@/types/pagination.types";
import type { Ingredient, Pizza, PizzaListQuery } from "@/types/pizza.types";
import { ADMIN_PIZZAS_PAGE_SIZE } from "@/utils/constants/pizza.constants";
import AdminPizzasView from "@/views/admin/AdminPizzasView.vue";

vi.mock("@/services/api/pizzas", () => ({
  listPizzas: vi.fn(),
  getPizza: vi.fn(),
  deletePizza: vi.fn(),
}));

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

const ingredient = (name: string) => ({ id: name, name }) as Ingredient;

const pizza = (id: string, name: string, ingredients: string[] = []): Pizza =>
  ({
    id,
    name,
    description: `${name} description`,
    image: null,
    price: 12.5,
    ingredients: ingredients.map(ingredient),
  }) as Pizza;

const MARGHERITA = pizza("p1", "Margherita", ["Tomato", "Mozzarella", "Basil"]);
const DIAVOLA = pizza("p2", "Diavola", ["Salami"]);
const PLAIN = pizza("p3", "Plain");

let catalog: Pizza[] = [];

function page(data: Pizza[], current = 1, total = data.length): Paginated<Pizza> {
  return { data, page: current, limit: ADMIN_PIZZAS_PAGE_SIZE, total, totalPages: 0 };
}

function serveCatalog(): void {
  vi.mocked(pizzasApi.listPizzas).mockImplementation((query: PizzaListQuery = {}) => {
    const search = query.search?.toLowerCase() ?? "";
    const matches = catalog.filter((item) => item.name.toLowerCase().includes(search));
    const limit = query.limit ?? ADMIN_PIZZAS_PAGE_SIZE;
    const current = query.page ?? 1;
    return Promise.resolve({
      ...page(matches.slice((current - 1) * limit, current * limit), current, matches.length),
      limit,
      totalPages: Math.ceil(matches.length / limit),
    });
  });
}

let wrapper: VueWrapper | undefined;

async function setup(path = "/admin/pizzas") {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Host = defineComponent({
    setup: () => () => [h(AdminPizzasView), h(BaseConfirmDialog)],
  });
  wrapper = mount(Host, {
    attachTo: document.body,
    global: {
      plugins: [
        createPinia(),
        router,
        PrimeVue,
        ConfirmationService,
        [VueQueryPlugin, { queryClient }],
      ],
    },
  });
  await flushPromises();
  return { wrapper, router };
}

const rowNames = (target: VueWrapper) =>
  target.findAll("[data-test='pizza-name']").map((name) => name.text());

const dialogButton = (label: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("[role='alertdialog'] button")].find(
    (button) => button.textContent.trim() === label
  );

beforeEach(() => {
  vi.resetAllMocks();
  catalog = [MARGHERITA, DIAVOLA, PLAIN];
  serveCatalog();
});

afterEach(() => {
  vi.useRealTimers();
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("AdminPizzasView", () => {
  it("lists pizzas with their ingredients and price, ten per page", async () => {
    const { wrapper } = await setup();

    expect(pizzasApi.listPizzas).toHaveBeenCalledWith({
      page: 1,
      limit: ADMIN_PIZZAS_PAGE_SIZE,
      search: "",
    });
    expect(rowNames(wrapper)).toEqual(["Margherita", "Diavola", "Plain"]);
    expect(wrapper.findAll("[data-test='pizza-ingredients']").map((cell) => cell.text())).toEqual([
      "Tomato, Mozzarella, Basil",
      "Salami",
      "—",
    ]);
    expect(wrapper.text()).toContain("$12.50");
  });

  it("shows how many pizzas are on the menu", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get("[data-test='page-subtitle']").text()).toBe("3 pizzas on the menu");
  });

  it("debounces the search into the URL and resets the page", async () => {
    const { wrapper, router } = await setup("/admin/pizzas?page=2");
    vi.useFakeTimers();

    await wrapper.get("input[type='search']").setValue("dia");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    vi.useRealTimers();
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ search: "dia" });
    expect(rowNames(wrapper)).toEqual(["Diavola"]);
  });

  it("offers to clear a search with no matches", async () => {
    const { wrapper, router } = await setup("/admin/pizzas?search=calzone");

    expect(wrapper.text()).toContain("No pizzas match “calzone”");

    const clear = wrapper.findAll("button").find((button) => button.text() === "Clear search");
    await clear?.trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({});
    expect(rowNames(wrapper)).toEqual(["Margherita", "Diavola", "Plain"]);
  });

  it("opens the add and edit pages", async () => {
    const { wrapper, router } = await setup();

    await wrapper.get("[aria-label='Edit Diavola']").trigger("click");
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("admin-pizza-edit");
    });
    expect(router.currentRoute.value.params.id).toBe("p2");

    await router.push("/admin/pizzas");
    const add = wrapper.findAll("button").find((button) => button.text().includes("Add Pizza"));
    await add?.trigger("click");
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("admin-pizza-new");
    });
  });

  describe("delete", () => {
    it("asks for confirmation, deletes the pizza and refreshes the list", async () => {
      vi.mocked(pizzasApi.deletePizza).mockImplementation((id) => {
        catalog = catalog.filter((item) => item.id !== id);
        return Promise.resolve();
      });
      const { wrapper } = await setup();

      await wrapper.get("[aria-label='Delete Diavola']").trigger("click");
      await flushPromises();

      expect(document.body.textContent).toContain('Delete "Diavola"?');
      expect(document.body.textContent).toContain("Existing orders will not be affected.");
      expect(pizzasApi.deletePizza).not.toHaveBeenCalled();

      dialogButton("Delete pizza")?.click();
      await flushPromises();

      expect(pizzasApi.deletePizza).toHaveBeenCalledWith("p2");
      expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ summary: "Pizza deleted" }));
      expect(rowNames(wrapper)).toEqual(["Margherita", "Plain"]);
      expect(wrapper.get("[data-test='page-subtitle']").text()).toBe("2 pizzas on the menu");
    });

    it("steps back a page after deleting the last pizza on it", async () => {
      catalog = Array.from({ length: ADMIN_PIZZAS_PAGE_SIZE + 1 }, (_, index) =>
        pizza(`p${String(index)}`, `Pizza ${String(index)}`)
      );
      vi.mocked(pizzasApi.deletePizza).mockImplementation((id) => {
        catalog = catalog.filter((item) => item.id !== id);
        return Promise.resolve();
      });
      const { wrapper, router } = await setup("/admin/pizzas?page=2");
      expect(rowNames(wrapper)).toEqual(["Pizza 10"]);

      await wrapper.get("[aria-label='Delete Pizza 10']").trigger("click");
      await flushPromises();
      dialogButton("Delete pizza")?.click();
      await flushPromises();

      expect(router.currentRoute.value.query.page).toBeUndefined();
      expect(rowNames(wrapper)).toHaveLength(ADMIN_PIZZAS_PAGE_SIZE);
    });

    it("keeps the pizza and reports the error when the delete fails", async () => {
      vi.mocked(pizzasApi.deletePizza).mockRejectedValue(new Error("Server error"));
      const { wrapper } = await setup();

      await wrapper.get("[aria-label='Delete Diavola']").trigger("click");
      await flushPromises();
      dialogButton("Delete pizza")?.click();
      await flushPromises();

      expect(toastAdd).not.toHaveBeenCalledWith(
        expect.objectContaining({ summary: "Pizza deleted" })
      );
      expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }));
      expect(rowNames(wrapper)).toContain("Diavola");
    });
  });

  it("offers a retry when the list fails to load", async () => {
    vi.mocked(pizzasApi.listPizzas).mockRejectedValue(new Error("Network Error"));
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Couldn't load pizzas");

    serveCatalog();
    const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
    await retry?.trigger("click");
    await flushPromises();

    expect(rowNames(wrapper)).toEqual(["Margherita", "Diavola", "Plain"]);
  });
});
