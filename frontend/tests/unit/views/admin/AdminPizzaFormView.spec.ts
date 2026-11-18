import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter, type Router, RouterView } from "vue-router";

import BaseConfirmDialog from "@/components/base/BaseConfirmDialog.vue";
import { routes } from "@/router/routes";
import * as ingredientsApi from "@/services/api/ingredients";
import * as pizzasApi from "@/services/api/pizzas";
import { ApiError } from "@/services/errors";
import type { Ingredient, Pizza } from "@/types/pizza.types";
import { PIZZA_NAME_TAKEN_MESSAGE } from "@/utils/constants/pizza.constants";

vi.mock("@/services/api/pizzas", () => ({
  listPizzas: vi.fn(),
  getPizza: vi.fn(),
  createPizza: vi.fn(),
  updatePizza: vi.fn(),
  uploadPizzaImage: vi.fn(),
  deletePizza: vi.fn(),
}));
vi.mock("@/services/api/ingredients", () => ({
  listIngredients: vi.fn(),
  createIngredient: vi.fn(),
}));

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

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
);

const BASIL = { id: "i1", name: "Basil" } as Ingredient;
const MOZZARELLA = { id: "i2", name: "Mozzarella" } as Ingredient;

const MARGHERITA = {
  id: "p1",
  name: "Margherita",
  description: "Tomato and mozzarella",
  price: 13.9,
  image: "/uploads/pizzas/p1.png",
  ingredients: [BASIL, MOZZARELLA],
} as Pizza;

const CREATED = {
  id: "p-new",
  name: "Diavola",
  description: "Spicy salami",
  price: 12.5,
  image: null,
  ingredients: [BASIL],
} as Pizza;

let wrapper: VueWrapper | undefined;

async function setup(path: string): Promise<{ wrapper: VueWrapper; router: Router }> {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Host = defineComponent({ setup: () => () => [h(RouterView), h(BaseConfirmDialog)] });
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

const button = (target: VueWrapper, label: string) => {
  const found = target.findAll("button").find((candidate) => candidate.text() === label);
  if (!found) {
    throw new Error(`No button "${label}"`);
  }
  return found;
};

const dialogButton = (label: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("[role='alertdialog'] button")].find(
    (candidate) => candidate.textContent.trim() === label
  );

async function fillBasics(target: VueWrapper, price = "12.50"): Promise<void> {
  await target.get("#pizza-name").setValue("Diavola");
  await target.get("#pizza-description").setValue("Spicy salami");
  const priceInput = target.get<HTMLInputElement>("#pizza-price");
  priceInput.element.value = price;
  await priceInput.trigger("blur");
}

async function addIngredient(target: VueWrapper, name: string): Promise<void> {
  await target.get("#new-ingredient").setValue(name);
  await button(target, "Add").trigger("click");
  await flushPromises();
}

async function chooseImage(target: VueWrapper): Promise<File> {
  const file = new File(["png"], "diavola.png", { type: "image/png" });
  const input = target.get<HTMLInputElement>("[data-test='image-input']");
  Object.defineProperty(input.element, "files", { value: [file], configurable: true });
  await input.trigger("change");
  return file;
}

async function submit(target: VueWrapper): Promise<void> {
  await target.get("form").trigger("submit");
  await flushPromises();
}

const chips = (target: VueWrapper) => target.findAll("li").map((chip) => chip.text());

beforeEach(() => {
  vi.resetAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
  vi.mocked(ingredientsApi.listIngredients).mockResolvedValue([BASIL, MOZZARELLA]);
  vi.mocked(pizzasApi.listPizzas).mockResolvedValue({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  vi.mocked(pizzasApi.getPizza).mockImplementation((id) => {
    const known = [MARGHERITA, CREATED].find((pizza) => pizza.id === id);
    return known
      ? Promise.resolve(known)
      : Promise.reject(new ApiError("Not found", { status: 404 }));
  });
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("AdminPizzaFormView — add", () => {
  it("creates the pizza, then uploads its image, then returns to the list", async () => {
    vi.mocked(pizzasApi.createPizza).mockResolvedValue(CREATED);
    vi.mocked(pizzasApi.uploadPizzaImage).mockResolvedValue({ ...CREATED, image: "/x.png" });
    const { wrapper, router } = await setup("/admin/pizzas/new");

    expect(wrapper.text()).toContain("Add New Pizza");
    await fillBasics(wrapper);
    await addIngredient(wrapper, "basil");
    const file = await chooseImage(wrapper);
    await submit(wrapper);

    expect(ingredientsApi.createIngredient).not.toHaveBeenCalled();
    expect(pizzasApi.createPizza).toHaveBeenCalledWith({
      name: "Diavola",
      description: "Spicy salami",
      price: 12.5,
      ingredientIds: ["i1"],
    });
    expect(pizzasApi.uploadPizzaImage).toHaveBeenCalledWith("p-new", file);
    expect(vi.mocked(pizzasApi.createPizza).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(pizzasApi.uploadPizzaImage).mock.invocationCallOrder[0] ?? 0
    );
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ summary: "Pizza added" }));
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("admin-pizzas");
    });
  });

  it("skips the upload when no image was chosen", async () => {
    vi.mocked(pizzasApi.createPizza).mockResolvedValue(CREATED);
    const { wrapper } = await setup("/admin/pizzas/new");

    await fillBasics(wrapper);
    await submit(wrapper);

    expect(pizzasApi.createPizza).toHaveBeenCalledOnce();
    expect(pizzasApi.uploadPizzaImage).not.toHaveBeenCalled();
  });

  it("creates a new ingredient and selects it", async () => {
    const TRUFFLE = { id: "i3", name: "Truffle oil" } as Ingredient;
    vi.mocked(ingredientsApi.createIngredient).mockImplementation(() => {
      vi.mocked(ingredientsApi.listIngredients).mockResolvedValue([BASIL, MOZZARELLA, TRUFFLE]);
      return Promise.resolve(TRUFFLE);
    });
    const { wrapper } = await setup("/admin/pizzas/new");

    await addIngredient(wrapper, "Truffle oil");

    expect(ingredientsApi.createIngredient).toHaveBeenCalledWith("Truffle oil");
    expect(chips(wrapper)).toEqual(["Truffle oil"]);
    expect(wrapper.get<HTMLInputElement>("#new-ingredient").element.value).toBe("");
  });

  it("validates before sending anything", async () => {
    const { wrapper } = await setup("/admin/pizzas/new");

    await submit(wrapper);

    expect(pizzasApi.createPizza).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Name cannot be empty");
    expect(wrapper.text()).toContain("Description cannot be empty");
    expect(wrapper.text()).toContain("Price must be greater than 0");
  });

  it("shows a duplicate name on the name field", async () => {
    vi.mocked(pizzasApi.createPizza).mockRejectedValue(
      new ApiError("Pizza with this name already exists", { status: 409 })
    );
    const { wrapper, router } = await setup("/admin/pizzas/new");

    await fillBasics(wrapper);
    await submit(wrapper);

    expect(wrapper.text()).toContain(PIZZA_NAME_TAKEN_MESSAGE);
    expect(router.currentRoute.value.name).toBe("admin-pizza-new");
  });

  it("switches to editing the new pizza when only the image upload fails, then retries it", async () => {
    vi.mocked(pizzasApi.createPizza).mockResolvedValue(CREATED);
    vi.mocked(pizzasApi.uploadPizzaImage).mockRejectedValueOnce(new Error("Network Error"));
    const { wrapper, router } = await setup("/admin/pizzas/new");

    await fillBasics(wrapper);
    const file = await chooseImage(wrapper);
    await submit(wrapper);
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("admin-pizza-edit");
    });

    expect(router.currentRoute.value.params.id).toBe("p-new");
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ summary: "Pizza added, but the image wasn't uploaded" })
    );

    vi.mocked(pizzasApi.uploadPizzaImage).mockResolvedValue(CREATED);
    await flushPromises();
    await submit(wrapper);

    expect(pizzasApi.createPizza).toHaveBeenCalledOnce();
    expect(pizzasApi.updatePizza).not.toHaveBeenCalled();
    expect(pizzasApi.uploadPizzaImage).toHaveBeenLastCalledWith("p-new", file);
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("admin-pizzas");
    });
  });
});

describe("AdminPizzaFormView — edit", () => {
  it("prefills the pizza and keeps the original name in the subtitle", async () => {
    const { wrapper } = await setup("/admin/pizzas/p1/edit");

    expect(pizzasApi.getPizza).toHaveBeenCalledWith("p1");
    expect(wrapper.get<HTMLInputElement>("#pizza-name").element.value).toBe("Margherita");
    expect(wrapper.get<HTMLInputElement>("#pizza-price").element.value).toBe("$13.90");
    expect(chips(wrapper)).toEqual(["Basil", "Mozzarella"]);
    expect(wrapper.get("[data-test='image-preview']").attributes("src")).toContain(
      "/uploads/pizzas/p1.png"
    );

    await wrapper.get("#pizza-name").setValue("Margherita Classica");

    expect(wrapper.get("[data-test='page-subtitle']").text()).toBe("Editing: Margherita");
  });

  it("enables saving only after a change, then sends the full body with ingredient ids", async () => {
    vi.mocked(pizzasApi.updatePizza).mockResolvedValue(MARGHERITA);
    const { wrapper, router } = await setup("/admin/pizzas/p1/edit");
    const save = () => wrapper.get("[data-test='submit-pizza']");

    expect(save().text()).toBe("Save changes");
    expect(save().attributes("disabled")).toBeDefined();

    await wrapper.get("#pizza-description").setValue("Updated description");
    expect(save().attributes("disabled")).toBeUndefined();
    await submit(wrapper);

    expect(pizzasApi.updatePizza).toHaveBeenCalledWith("p1", {
      name: "Margherita",
      description: "Updated description",
      price: 13.9,
      ingredientIds: ["i1", "i2"],
    });
    expect(pizzasApi.uploadPizzaImage).not.toHaveBeenCalled();
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ summary: "Pizza updated" }));
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("admin-pizzas");
    });
  });

  it("uploads a replacement image without resending unchanged details", async () => {
    vi.mocked(pizzasApi.uploadPizzaImage).mockResolvedValue(MARGHERITA);
    const { wrapper } = await setup("/admin/pizzas/p1/edit");

    const file = await chooseImage(wrapper);
    await submit(wrapper);

    expect(pizzasApi.updatePizza).not.toHaveBeenCalled();
    expect(pizzasApi.uploadPizzaImage).toHaveBeenCalledWith("p1", file);
  });

  it("shows a not-found state for a missing pizza", async () => {
    vi.mocked(pizzasApi.getPizza).mockRejectedValue(new ApiError("Not found", { status: 404 }));
    const { wrapper } = await setup("/admin/pizzas/missing/edit");

    expect(wrapper.text()).toContain("Pizza not found");
    expect(wrapper.find("form").exists()).toBe(false);
  });
});

describe("AdminPizzaFormView — unsaved changes", () => {
  it("leaves without asking when nothing changed", async () => {
    const { wrapper, router } = await setup("/admin/pizzas/p1/edit");

    await button(wrapper, "Cancel").trigger("click");
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("admin-pizzas");
    });
    expect(document.body.textContent).not.toContain("Discard unsaved changes?");
  });

  it("asks before discarding changes and stays when told to keep editing", async () => {
    const { wrapper, router } = await setup("/admin/pizzas/p1/edit");
    await wrapper.get("#pizza-name").setValue("Edited");

    await button(wrapper, "Cancel").trigger("click");
    await flushPromises();
    expect(document.body.textContent).toContain("Discard unsaved changes?");

    dialogButton("Keep editing")?.click();
    await flushPromises();
    expect(router.currentRoute.value.name).toBe("admin-pizza-edit");

    await button(wrapper, "Cancel").trigger("click");
    await flushPromises();
    dialogButton("Discard changes")?.click();
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("admin-pizzas");
    });
  });
});
