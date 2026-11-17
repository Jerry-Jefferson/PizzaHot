import { describe, expect, it } from "vitest";

import { OrderStatus } from "@/types/order.types";
import {
  ORDER_STATUS_META,
  ORDER_STATUSES,
  PAYMENT_METHOD_META,
  PAYMENT_METHODS,
} from "@/utils/constants/order.constants";

describe("ORDER_STATUS_META", () => {
  it("covers all 7 backend statuses in workflow order", () => {
    expect(ORDER_STATUSES).toEqual([
      "pending",
      "confirmed",
      "preparing",
      "ready_for_delivery",
      "delivering",
      "completed",
      "cancelled",
    ]);
    expect(Object.keys(ORDER_STATUS_META)).toHaveLength(7);
  });

  it.each([
    [OrderStatus.PENDING, "Pending", "processing"],
    [OrderStatus.CONFIRMED, "Confirmed", "info"],
    [OrderStatus.PREPARING, "Preparing", "warning"],
    [OrderStatus.READY_FOR_DELIVERY, "Ready", "warning"],
    [OrderStatus.DELIVERING, "Out for delivery", "warning"],
    [OrderStatus.COMPLETED, "Completed", "success"],
    [OrderStatus.CANCELLED, "Cancelled", "danger"],
  ])("maps %s to %s / %s", (status, label, tone) => {
    expect(ORDER_STATUS_META[status]).toEqual({ label, tone });
  });
});

describe("PAYMENT_METHOD_META", () => {
  it("has a label and icon for every payment method", () => {
    expect(PAYMENT_METHODS).toEqual(["card_online", "card_on_delivery", "cash"]);
    for (const method of PAYMENT_METHODS) {
      expect(PAYMENT_METHOD_META[method].label).not.toBe("");
      expect(PAYMENT_METHOD_META[method].icon).toMatch(/^pi pi-/);
    }
  });
});
