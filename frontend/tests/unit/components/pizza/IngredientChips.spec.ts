import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import IngredientChips from "@/components/pizza/IngredientChips.vue";

const INGREDIENTS = [
  { id: "i1", name: "Mozzarella" },
  { id: "i2", name: "Basil" },
];

describe("IngredientChips", () => {
  it("renders the label and one chip per ingredient", () => {
    const wrapper = mount(IngredientChips, { props: { ingredients: INGREDIENTS } });

    expect(wrapper.text()).toContain("Ingredients");
    expect(wrapper.findAll("li").map((chip) => chip.text())).toEqual(["Mozzarella", "Basil"]);
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("renders nothing without ingredients", () => {
    const wrapper = mount(IngredientChips, { props: { ingredients: [] } });

    expect(wrapper.html()).toBe("<!--v-if-->");
  });

  it("emits remove with the ingredient id in the removable variant", async () => {
    const wrapper = mount(IngredientChips, { props: { ingredients: INGREDIENTS, removable: true } });

    await wrapper.get("button[aria-label='Remove Basil']").trigger("click");

    expect(wrapper.emitted("remove")).toEqual([["i2"]]);
  });
});
