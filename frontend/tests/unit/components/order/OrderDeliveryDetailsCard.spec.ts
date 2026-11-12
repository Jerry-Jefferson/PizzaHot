import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import OrderDeliveryDetailsCard from "@/components/order/OrderDeliveryDetailsCard.vue";
import type { Order } from "@/types/order.types";

type CardOrder = Pick<Order, "delivery" | "paymentMethod" | "address" | "comment">;

const mountCard = (order: CardOrder) => mount(OrderDeliveryDetailsCard, { props: { order } });

describe("OrderDeliveryDetailsCard", () => {
  it("shows method, payment, address and instructions for a delivery", () => {
    const wrapper = mountCard({
      delivery: "delivery",
      paymentMethod: "card_on_delivery",
      address: "1 Pizza Street",
      comment: "Ring twice",
    });

    expect(wrapper.get("[data-test='delivery-method']").text()).toBe("🛵 Delivery");
    expect(wrapper.get("[data-test='payment-method']").text()).toBe("Card on delivery");
    expect(wrapper.get("[data-test='payment-method'] i").classes()).toContain("pi-wallet");
    expect(wrapper.get("[data-test='delivery-address']").text()).toBe("1 Pizza Street");
    expect(wrapper.get("[data-test='delivery-comment']").text()).toBe("Ring twice");
  });

  it("hides the address for pickup and the instructions when empty", () => {
    const wrapper = mountCard({
      delivery: "pickup",
      paymentMethod: "cash",
      address: "",
      comment: null,
    });

    expect(wrapper.get("[data-test='delivery-method']").text()).toBe("🏪 Pick up");
    expect(wrapper.get("[data-test='payment-method']").text()).toBe("Cash");
    expect(wrapper.find("[data-test='delivery-address']").exists()).toBe(false);
    expect(wrapper.find("[data-test='delivery-comment']").exists()).toBe(false);
  });
});
