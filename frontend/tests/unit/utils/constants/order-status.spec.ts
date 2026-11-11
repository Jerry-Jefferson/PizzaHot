import { describe, expect, it } from "vitest";

import { OrderStatus } from "@/types/order.types";
import { ORDER_STATUS_META, ORDER_STATUSES } from "@/utils/constants/order-status";

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
