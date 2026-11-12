import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import OrderStatusBadge from "@/components/order/OrderStatusBadge.vue";
import type { OrderStatus } from "@/types/order.types";

describe("OrderStatusBadge", () => {
  it.each<[OrderStatus, string, string]>([
    ["pending", "Pending", "processing"],
    ["confirmed", "Confirmed", "info"],
    ["preparing", "Preparing", "warning"],
    ["ready_for_delivery", "Ready", "warning"],
    ["delivering", "Out for delivery", "warning"],
    ["completed", "Completed", "success"],
    ["cancelled", "Cancelled", "danger"],
  ])("shows %s as %s with the %s tone and a dot", (status, label, tone) => {
    const badge = mount(OrderStatusBadge, { props: { status } }).get("[data-test='order-status']");

    expect(badge.text()).toBe(label);
    expect(badge.attributes("data-tone")).toBe(tone);
    expect(badge.find("[aria-hidden='true']").exists()).toBe(true);
  });
});
