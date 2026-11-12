import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import OrderSummaryCard from "@/components/cart/OrderSummaryCard.vue";

describe("OrderSummaryCard", () => {
  it("shows subtotal and total from props without a discount row", () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { totalPrice: 40, discountAmount: 0, finalPrice: 40 },
    });

    expect(wrapper.get("h2").text()).toBe("Order Summary");
    expect(wrapper.get("[data-test='summary-subtotal']").text()).toBe("$40.00");
    expect(wrapper.get("[data-test='summary-total']").text()).toBe("$40.00");
    expect(wrapper.find("[data-test='summary-discount']").exists()).toBe(false);
    expect(wrapper.text()).not.toMatch(/delivery/i);
  });

  it("shows the discount with the promo code when it is above 0", () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { totalPrice: 40, discountAmount: 8, finalPrice: 32, promoCode: "WELCOME20" },
    });

    expect(wrapper.get("[data-test='summary-discount']").text()).toBe(
      "Discount (WELCOME20)−$8.00"
    );
    expect(wrapper.get("[data-test='summary-total']").text()).toBe("$32.00");
  });

  it("uses the totals it is given instead of recomputing them", () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { totalPrice: 10, discountAmount: 1, finalPrice: 7.5 },
    });

    expect(wrapper.get("[data-test='summary-total']").text()).toBe("$7.50");
    expect(wrapper.get("[data-test='summary-discount']").text()).toBe("Discount−$1.00");
  });

  it("renders the content and actions slots", () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { totalPrice: 0, discountAmount: 0, finalPrice: 0 },
      slots: { default: "<p>Items</p>", actions: "<button>Go</button>" },
    });

    expect(wrapper.text()).toContain("Items");
    expect(wrapper.get("button").text()).toBe("Go");
  });
});
