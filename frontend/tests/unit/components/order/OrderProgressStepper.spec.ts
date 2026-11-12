import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import OrderProgressStepper from "@/components/order/OrderProgressStepper.vue";
import { DeliveryType, type OrderStatus } from "@/types/order.types";

const mountStepper = (status: OrderStatus, delivery: DeliveryType = DeliveryType.DELIVERY) =>
  mount(OrderProgressStepper, { props: { status, delivery } });

describe("OrderProgressStepper", () => {
  it("renders the delivery steps with their states", () => {
    const wrapper = mountStepper("preparing");

    const steps = wrapper.findAll("li");
    expect(steps.map((step) => step.text())).toEqual([
      "Confirmed",
      "Preparing",
      "Ready",
      "Out for delivery",
      "Delivered",
    ]);
    expect(steps.map((step) => step.attributes("data-state"))).toEqual([
      "done",
      "current",
      "upcoming",
      "upcoming",
      "upcoming",
    ]);
    expect(steps[1]?.attributes("aria-current")).toBe("step");
  });

  it("styles done, current and upcoming circles", () => {
    const circles = mountStepper("preparing").findAll("[data-test='step-circle']");

    expect(circles[0]?.classes()).toEqual(
      expect.arrayContaining(["bg-primary", "text-primary-foreground"])
    );
    expect(circles[0]?.find(".pi-check").exists()).toBe(true);
    expect(circles[1]?.classes()).toEqual(expect.arrayContaining(["border-2", "border-primary"]));
    expect(circles[1]?.find(".animate-pulse").exists()).toBe(true);
    expect(circles[2]?.classes()).toEqual(expect.arrayContaining(["border-2", "border-border"]));
  });

  it("colours connectors leading into reached steps", () => {
    const connectors = mountStepper("ready_for_delivery").findAll("[data-test='step-connector']");

    expect(connectors.map((line) => line.classes("bg-primary"))).toEqual([
      true,
      true,
      false,
      false,
    ]);
  });

  it("uses the pickup steps", () => {
    const wrapper = mountStepper("completed", DeliveryType.PICKUP);

    expect(wrapper.findAll("li").map((step) => step.text())).toEqual([
      "Confirmed",
      "Preparing",
      "Ready for pickup",
      "Picked up",
    ]);
    expect(wrapper.findAll("[data-state='done']")).toHaveLength(4);
  });

  it("is hidden for a cancelled order", () => {
    expect(mountStepper("cancelled").find("ol").exists()).toBe(false);
  });
});
