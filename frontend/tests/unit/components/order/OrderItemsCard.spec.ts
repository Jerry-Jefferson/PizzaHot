import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import OrderItemsCard from "@/components/order/OrderItemsCard.vue";
import type { Order } from "@/types/order.types";

type CardOrder = Pick<
  Order,
  "orderItems" | "totalPrice" | "discountAmount" | "finalPrice" | "codeApplied"
>;

const order = (overrides: Partial<CardOrder> = {}): CardOrder => ({
  orderItems: [
    {
      id: "i1",
      pizzaId: "p1",
      pizzaName: "Quattro Formaggi",
      priceAtPurchase: 13.65,
      quantity: 2,
      subtotal: 27.3,
    },
  ],
  totalPrice: 27.3,
  discountAmount: 0,
  finalPrice: 27.3,
  codeApplied: null,
  ...overrides,
});

describe("OrderItemsCard", () => {
  it("lists each item with quantity, unit price and subtotal", () => {
    const wrapper = mount(OrderItemsCard, { props: { order: order() } });

    expect(wrapper.get("h2").text()).toBe("Items ordered");
    const row = wrapper.get("[data-test='order-item']");
    expect(row.text()).toContain("Quattro Formaggi");
    expect(row.text()).toContain("Qty 2 · $13.65 each");
    expect(row.text()).toMatch(/\$27\.30$/);
  });

  it("shows subtotal and total without a discount or fee row", () => {
    const wrapper = mount(OrderItemsCard, { props: { order: order() } });

    expect(wrapper.get("[data-test='order-subtotal']").text()).toBe("$27.30");
    expect(wrapper.get("[data-test='order-final-total']").text()).toBe("$27.30");
    expect(wrapper.find("[data-test='order-discount']").exists()).toBe(false);
    expect(wrapper.text()).not.toMatch(/delivery|fee/i);
  });

  it.each([0, null])("hides the discount row when the discount is %s", (discountAmount) => {
    const wrapper = mount(OrderItemsCard, { props: { order: order({ discountAmount }) } });

    expect(wrapper.find("[data-test='order-discount']").exists()).toBe(false);
  });

  it("shows the discount with the applied code when it is above 0", () => {
    const wrapper = mount(OrderItemsCard, {
      props: { order: order({ discountAmount: 5.46, finalPrice: 21.84, codeApplied: "WELCOME20" }) },
    });

    expect(wrapper.get("[data-test='order-discount']").text()).toBe(
      "Discount (WELCOME20)−$5.46"
    );
    expect(wrapper.get("[data-test='order-final-total']").text()).toBe("$21.84");
  });
});
