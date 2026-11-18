import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";

import MostPopularPizzaCard from "@/components/admin/MostPopularPizzaCard.vue";
import type { MostOrderedPizza } from "@/types/analytics.types";

function mountCard(
  props: { pizza?: MostOrderedPizza | null; loading?: boolean; error?: boolean } = {}
) {
  return mount(MostPopularPizzaCard, {
    props: { periodLabel: "Nov 2026", ...props },
    global: { plugins: [PrimeVue] },
  });
}

describe("MostPopularPizzaCard", () => {
  it("shows the pizza and how often it was ordered in the period", () => {
    const wrapper = mountCard({ pizza: { pizzaName: "Diavola", orderCount: 12 } });

    expect(wrapper.text()).toContain("Most popular pizza");
    expect(wrapper.get("[data-test='popular-pizza-name']").text()).toBe("Diavola");
    expect(wrapper.get("[data-test='popular-pizza-orders']").text()).toBe("12 orders in Nov 2026");
  });

  it("uses the singular for one order", () => {
    const wrapper = mountCard({ pizza: { pizzaName: "Diavola", orderCount: 1 } });

    expect(wrapper.get("[data-test='popular-pizza-orders']").text()).toBe("1 order in Nov 2026");
  });

  it("highlights the card with the primary tint", () => {
    const wrapper = mountCard({ pizza: { pizzaName: "Diavola", orderCount: 3 } });

    expect(wrapper.get("[data-test='popular-pizza-card']").classes()).toEqual(
      expect.arrayContaining(["bg-primary/5", "border-primary/20"])
    );
  });

  it("says when nothing was ordered in the period", () => {
    const wrapper = mountCard({ pizza: null });

    expect(wrapper.text()).toContain("No orders yet");
    expect(wrapper.text()).toContain("Nothing was ordered in Nov 2026.");
    expect(wrapper.find("[data-test='popular-pizza-name']").exists()).toBe(false);
  });

  it("shows a skeleton while loading", () => {
    const wrapper = mountCard({ loading: true });

    expect(wrapper.find("[data-test='popular-pizza-skeleton']").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("No orders yet");
  });

  it("offers a retry when loading fails", async () => {
    const wrapper = mountCard({ error: true });

    expect(wrapper.text()).toContain("Couldn't load the most popular pizza");
    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("retry")).toHaveLength(1);
  });
});
