import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import OrderListCard from "@/components/order/OrderListCard.vue";
import { routes } from "@/router/routes";
import type { Order, OrderItem } from "@/types/order.types";

const ORDER_ID = "3f2a9c1e-7b4d-4e8a-9c2f-1a2b3c4d5e6f";

const orderItem = (pizzaName: string, quantity = 1): OrderItem => ({
  id: pizzaName,
  pizzaId: null,
  pizzaName,
  priceAtPurchase: 10,
  quantity,
  subtotal: 10 * quantity,
});

const order = (orderItems: OrderItem[]): Order =>
  ({
    id: ORDER_ID,
    status: "preparing",
    finalPrice: 27.3,
    createdAt: new Date(2025, 8, 20, 18, 32).toISOString(),
    orderItems,
  }) as Order;

function mountCard(props: { order: Order }) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  return mount(OrderListCard, { props, global: { plugins: [router] } });
}

describe("OrderListCard", () => {
  it("shows the short order number, status, total and date", () => {
    const wrapper = mountCard({ order: order([orderItem("Margherita")]) });

    expect(wrapper.get("[data-test='order-number']").text()).toBe("#3f2a9c1e");
    expect(wrapper.get("[data-test='order-status']").text()).toBe("Preparing");
    expect(wrapper.get("[data-test='order-total']").text()).toBe("$27.30");
    expect(wrapper.get("time").text()).toBe("Sat, Sep 20, 2025 · 06:32 PM");
  });

  it("links the whole card to the order details", () => {
    const wrapper = mountCard({ order: order([orderItem("Margherita")]) });

    const link = wrapper.get("a");
    expect(link.find("[data-test='order-number']").exists()).toBe(true);
    expect(link.find("[data-test='order-items']").exists()).toBe(true);
    expect(link.attributes("href")).toBe(`/my-orders/${ORDER_ID}`);
  });

  it("summarises the items", () => {
    const wrapper = mountCard({
      order: order([orderItem("Margherita Classica"), orderItem("Quattro Formaggi", 2)]),
    });

    expect(wrapper.get("[data-test='order-items']").text()).toBe(
      "Margherita Classica ×1, Quattro Formaggi ×2"
    );
  });

  it("truncates the summary after three items", () => {
    const wrapper = mountCard({
      order: order(["A", "B", "C", "D", "E"].map((name) => orderItem(name))),
    });

    const summary = wrapper.get("[data-test='order-items']");
    expect(summary.text()).toBe("A ×1, B ×1, C ×1 +2 more");
    expect(summary.classes()).toContain("truncate");
  });
});
