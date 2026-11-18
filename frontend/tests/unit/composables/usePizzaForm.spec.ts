import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick, ref } from "vue";

import { usePizzaForm } from "@/composables/usePizzaForm";
import { ApiError } from "@/services/errors";
import type { Ingredient, Pizza } from "@/types/pizza.types";
import { PIZZA_NAME_TAKEN_MESSAGE } from "@/utils/constants/pizza.constants";

const ingredient = (id: string) => ({ id, name: id }) as Ingredient;

const pizza = (overrides: Partial<Pizza> = {}): Pizza =>
  ({
    id: "p1",
    name: "Margherita",
    description: "Tomato and mozzarella",
    price: 13.9,
    image: null,
    ingredients: [ingredient("i1"), ingredient("i2")],
    ...overrides,
  }) as Pizza;

function withForm(source?: Parameters<typeof usePizzaForm>[0]) {
  let result!: ReturnType<typeof usePizzaForm>;
  mount(
    defineComponent({
      setup: () => {
        result = usePizzaForm(source);
        return () => null;
      },
    })
  );
  return result;
}

describe("usePizzaForm", () => {
  it("starts empty and clean for a new pizza", () => {
    const form = withForm();

    expect(form.form).toEqual({ name: "", description: "", price: null });
    expect(form.ingredientIds.value).toEqual([]);
    expect(form.isDirty.value).toBe(false);
  });

  it("requires a name, a description and a positive price", async () => {
    const form = withForm();
    form.form.name = "   ";
    form.form.price = 0;

    expect(await form.validate()).toBe(false);
    expect(form.errors.value).toEqual({
      name: "Name cannot be empty",
      description: "Description cannot be empty",
      price: "Price must be greater than 0",
    });
  });

  it("builds a trimmed payload that always includes the ingredient ids", async () => {
    const form = withForm();
    form.form.name = "  Diavola ";
    form.form.description = " Spicy salami ";
    form.form.price = 12.5;

    expect(await form.validate()).toBe(true);
    expect(form.toPayload()).toEqual({
      name: "Diavola",
      description: "Spicy salami",
      price: 12.5,
      ingredientIds: [],
    });
  });

  it("prefills from the pizza being edited and remembers its original name", () => {
    const form = withForm(pizza());

    expect(form.form).toEqual({
      name: "Margherita",
      description: "Tomato and mozzarella",
      price: 13.9,
    });
    expect(form.ingredientIds.value).toEqual(["i1", "i2"]);
    expect(form.originalName.value).toBe("Margherita");
    expect(form.isDirty.value).toBe(false);
  });

  it("becomes dirty on any field or ingredient change, and clean again when undone", () => {
    const form = withForm(pizza());

    form.form.name = "Margherita Classica";
    expect(form.isDirty.value).toBe(true);
    expect(form.originalName.value).toBe("Margherita");
    form.form.name = "Margherita";
    expect(form.isDirty.value).toBe(false);

    form.ingredientIds.value = ["i2", "i1"];
    expect(form.isDirty.value).toBe(false);
    form.ingredientIds.value = ["i1"];
    expect(form.isDirty.value).toBe(true);
  });

  it("does not overwrite edits when the same pizza is refetched", async () => {
    const source = ref<Pizza | undefined>(pizza());
    const form = withForm(source);
    form.form.name = "Edited";

    source.value = pizza({ price: 15 });
    await nextTick();

    expect(form.form.name).toBe("Edited");
    expect(form.form.price).toBe(13.9);
  });

  it("fills in once the pizza finishes loading", async () => {
    const source = ref<Pizza | undefined>(undefined);
    const form = withForm(source);

    source.value = pizza();
    await nextTick();

    expect(form.form.name).toBe("Margherita");
  });

  it("treats the saved pizza as the new clean state", () => {
    const form = withForm();
    form.form.name = "Diavola";

    form.markSaved(pizza({ id: "p2", name: "Diavola", ingredients: [] }));

    expect(form.isDirty.value).toBe(false);
    expect(form.originalName.value).toBe("Diavola");
  });

  it("shows a duplicate-name conflict on the name field", () => {
    const form = withForm();

    form.applyServerError(new ApiError("Pizza with this name already exists", { status: 409 }));

    expect(form.errors.value.name).toBe(PIZZA_NAME_TAKEN_MESSAGE);
    expect(form.formError.value).toBeNull();
  });

  it("shows other server errors as a form error", () => {
    const form = withForm();

    form.applyServerError(new ApiError("Internal server error", { status: 500 }));

    expect(form.formError.value).toBe("Internal server error");
  });
});
