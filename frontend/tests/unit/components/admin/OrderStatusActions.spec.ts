import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";

import OrderStatusActions from "@/components/admin/OrderStatusActions.vue";
import { DeliveryType, type OrderStatus } from "@/types/order.types";

function mountActions(status: OrderStatus, delivery: DeliveryType = DeliveryType.DELIVERY) {
  return mount(OrderStatusActions, {
    props: { status, delivery },
    global: { plugins: [PrimeVue] },
  });
}

const labels = (wrapper: ReturnType<typeof mountActions>) =>
  wrapper.findAll("button").map((button) => button.text());

describe("OrderStatusActions", () => {
  it("offers to confirm or cancel a pending order", () => {
    const wrapper = mountActions("pending");

    expect(wrapper.text()).toContain("Update status");
    expect(labels(wrapper)).toEqual(["Mark as confirmed", "Mark as cancelled"]);
  });

  it.each<[DeliveryType, string]>([
    [DeliveryType.DELIVERY, "Mark as delivering"],
    [DeliveryType.PICKUP, "Mark as picked up"],
  ])("offers the next step for a ready %s order", (delivery, label) => {
    expect(labels(mountActions("ready_for_delivery", delivery))).toEqual([label]);
  });

  it("emits the chosen next status", async () => {
    const wrapper = mountActions("confirmed");

    await wrapper.get("[data-test='status-action-preparing']").trigger("click");
    await wrapper.get("[data-test='status-action-cancelled']").trigger("click");

    expect(wrapper.emitted("change")).toEqual([["preparing"], ["cancelled"]]);
  });

  it.each<OrderStatus>(["completed", "cancelled"])("says a %s order is closed", (status) => {
    const wrapper = mountActions(status);

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Update status");
    expect(wrapper.get("[data-test='order-closed']").text()).toBe("This order is closed.");
  });

  it("disables every action while an update runs", () => {
    const wrapper = mount(OrderStatusActions, {
      props: { status: "pending", delivery: DeliveryType.DELIVERY, disabled: true },
      global: { plugins: [PrimeVue] },
    });

    expect(wrapper.findAll("button").every((button) => button.element.disabled)).toBe(true);
  });
});
