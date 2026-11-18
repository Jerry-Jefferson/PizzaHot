import { mount, type VueWrapper } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it, vi } from "vitest";

import PizzaIngredientsCard from "@/components/admin/PizzaIngredientsCard.vue";
import type { Ingredient } from "@/types/pizza.types";

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
);

const ALL = [
  { id: "i1", name: "Basil" },
  { id: "i2", name: "Mozzarella" },
  { id: "i3", name: "Tomato" },
] as Ingredient[];

function setup(props: { selectedIds?: string[]; addError?: string | null; adding?: boolean } = {}) {
  const wrapper: VueWrapper = mount(PizzaIngredientsCard, {
    props: {
      ingredients: ALL,
      selectedIds: [],
      newIngredientName: "",
      ...props,
      "onUpdate:selectedIds": (selectedIds: string[]) => wrapper.setProps({ selectedIds }),
      "onUpdate:newIngredientName": (newIngredientName: string) =>
        wrapper.setProps({ newIngredientName }),
    },
    global: { plugins: [PrimeVue] },
  });
  return wrapper;
}

const addButton = (wrapper: VueWrapper) => {
  const button = wrapper.findAll("button").find((candidate) => candidate.text() === "Add");
  if (!button) {
    throw new Error("No Add button");
  }
  return button;
};

describe("PizzaIngredientsCard", () => {
  it("says when no ingredients are selected", () => {
    expect(setup().get("[data-test='no-ingredients']").text()).toBe("No ingredients added yet");
  });

  it("shows the selected ingredients as removable chips in selection order", async () => {
    const wrapper = setup({ selectedIds: ["i3", "i1"] });

    expect(wrapper.findAll("li").map((chip) => chip.text())).toEqual(["Tomato", "Basil"]);

    await wrapper.get("[aria-label='Remove Tomato']").trigger("click");

    expect(wrapper.emitted("update:selectedIds")?.[0]).toEqual([["i1"]]);
  });

  it("emits a trimmed name to add a new ingredient", async () => {
    const wrapper = setup();

    await wrapper.get("#new-ingredient").setValue("  Truffle oil ");
    await addButton(wrapper).trigger("click");

    expect(wrapper.emitted("add")).toEqual([["Truffle oil"]]);
  });

  it("adds on Enter without submitting the surrounding form", async () => {
    const wrapper = setup();

    await wrapper.get("#new-ingredient").setValue("Oregano");
    await wrapper.get("#new-ingredient").trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted("add")).toEqual([["Oregano"]]);
  });

  it("disables adding for a blank name or while a request runs", async () => {
    const wrapper = setup();
    expect(addButton(wrapper).attributes("disabled")).toBeDefined();

    await wrapper.get("#new-ingredient").setValue("Oregano");
    expect(addButton(wrapper).attributes("disabled")).toBeUndefined();

    await wrapper.setProps({ adding: true });
    expect(addButton(wrapper).attributes("disabled")).toBeDefined();
  });

  it("shows an error from adding an ingredient", () => {
    const wrapper = setup({ addError: "Ingredient with this name already exists" });

    expect(wrapper.get("[data-test='ingredient-error']").text()).toBe(
      "Ingredient with this name already exists"
    );
  });
});
