import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import PizzaCard from "@/components/pizza/PizzaCard.vue";
import { routes } from "@/router/routes";
import type { Pizza } from "@/types/pizza.types";
import { MEDIA_PLACEHOLDER_URL } from "@/utils/media-url";

const pizza = (overrides: Partial<Pizza> = {}): Pizza => ({
  id: "p1",
  name: "Margherita",
  description: "Tomato, mozzarella, basil",
  image: "/uploads/pizzas/margherita.webp",
  price: 12.5,
  ingredients: [
    { id: "i1", name: "Mozzarella", createdAt: "", updatedAt: "" },
    { id: "i2", name: "Basil", createdAt: "", updatedAt: "" },
  ],
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

function mountCard(props: InstanceType<typeof PizzaCard>["$props"]) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  return mount(PizzaCard, { props, global: { plugins: [PrimeVue, router] } });
}

describe("PizzaCard", () => {
  it("renders name, price, description, ingredients and image", () => {
    const wrapper = mountCard({ pizza: pizza() });

    expect(wrapper.get("h3").text()).toBe("Margherita");
    expect(wrapper.get("[data-test='pizza-price']").text()).toBe("$12.50");
    expect(wrapper.text()).toContain("Tomato, mozzarella, basil");
    expect(wrapper.get("[data-test='pizza-ingredients']").text()).toBe("Mozzarella, Basil");
    expect(wrapper.get("img").attributes()).toMatchObject({
      src: "/uploads/pizzas/margherita.webp",
      alt: "Margherita",
    });
  });

  it("falls back to the placeholder image and hides empty ingredients", () => {
    const wrapper = mountCard({ pizza: pizza({ image: null, ingredients: [] }) });

    expect(wrapper.get("img").attributes("src")).toBe(MEDIA_PLACEHOLDER_URL);
    expect(wrapper.find("[data-test='pizza-ingredients']").exists()).toBe(false);
  });

  it("links the image and title to the pizza details page", () => {
    const wrapper = mountCard({ pizza: pizza() });

    const link = wrapper.get("a");
    expect(link.attributes("href")).toBe("/pizzas/p1");
    expect(link.find("img").exists()).toBe(true);
    expect(link.find("h3").exists()).toBe(true);
    expect(link.find("button").exists()).toBe(false);
  });

  it("emits addToCart with the pizza", async () => {
    const wrapper = mountCard({ pizza: pizza() });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("addToCart")).toEqual([[pizza()]]);
  });

  it("shows the quantity already in the cart", () => {
    const wrapper = mountCard({ pizza: pizza(), cartQuantity: 3 });

    expect(wrapper.get("button").text()).toContain("In cart · 3");
  });

  it("disables the button while adding", () => {
    const wrapper = mountCard({ pizza: pizza(), adding: true });

    expect(wrapper.get("button").attributes()).toHaveProperty("disabled");
  });
});
