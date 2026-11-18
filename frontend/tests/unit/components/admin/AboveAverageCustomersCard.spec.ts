import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";

import AboveAverageCustomersCard from "@/components/admin/AboveAverageCustomersCard.vue";
import type { UserAboveAverageCheck } from "@/types/analytics.types";

const customer = (
  userId: string,
  overrides: Partial<UserAboveAverageCheck> = {}
): UserAboveAverageCheck => ({
  userId,
  email: `${userId}@example.com`,
  name: null,
  orderCount: 4,
  averageCheck: 40,
  globalAverageCheck: 25.5,
  ...overrides,
});

const CUSTOMERS = [
  customer("ada", { name: "Ada", orderCount: 6, averageCheck: 50 }),
  customer("alan", { orderCount: 1, averageCheck: 25 }),
  customer("ghost", { email: "", averageCheck: 37.5 }),
];

function mountCard(
  props: { customers?: UserAboveAverageCheck[]; loading?: boolean; error?: boolean } = {}
) {
  return mount(AboveAverageCustomersCard, {
    props: { customers: CUSTOMERS, ...props },
    global: { plugins: [PrimeVue] },
  });
}

const texts = (wrapper: ReturnType<typeof mountCard>, test: string) =>
  wrapper.findAll(`[data-test='${test}']`).map((element) => element.text());

describe("AboveAverageCustomersCard", () => {
  it("shows the global average check for all time", () => {
    const wrapper = mountCard();

    expect(wrapper.text()).toContain("Customers above average check");
    expect(wrapper.get("[data-test='global-average']").text().replace(/\s+/g, " ")).toBe(
      "All time · Global average $25.50"
    );
  });

  it("lists each customer with name, order count and average check", () => {
    const wrapper = mountCard();

    expect(texts(wrapper, "customer-name")).toEqual([
      "Ada",
      "alan@example.com",
      "Unknown customer",
    ]);
    expect(texts(wrapper, "customer-orders")).toEqual(["6 orders", "1 order", "4 orders"]);
    expect(texts(wrapper, "customer-average")).toEqual(["$50.00", "$25.00", "$37.50"]);
  });

  it("scales the bars to the highest average check", () => {
    const wrapper = mountCard();

    expect(
      wrapper.findAll("[data-test='customer-bar']").map((bar) => bar.attributes("style"))
    ).toEqual(["width: 100%;", "width: 50%;", "width: 75%;"]);
  });

  it("explains when no customer is above average yet", () => {
    const wrapper = mountCard({ customers: [] });

    expect(wrapper.text()).toContain("No customers above average yet");
    expect(wrapper.get("[data-test='global-average']").text()).toBe("All time");
  });

  it("shows a skeleton while loading", () => {
    const wrapper = mountCard({ customers: [], loading: true });

    expect(wrapper.find("[data-test='customers-skeleton']").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("No customers above average yet");
  });

  it("offers a retry when loading fails", async () => {
    const wrapper = mountCard({ customers: [], error: true });

    expect(wrapper.text()).toContain("Couldn't load customers");
    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("retry")).toHaveLength(1);
  });
});
