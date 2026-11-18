import { describe, expect, it } from "vitest";

import { DeliveryType, type NextOrderStatus, type OrderStatus } from "@/types/order.types";
import { ORDER_STATUSES, type ProgressStepState } from "@/utils/constants/order.constants";
import {
  getNextStatuses,
  getProgressSteps,
  getStatusActionLabel,
  getStepState,
  isFinalOrderStatus,
  summarizeOrderItems,
} from "@/utils/order";

const items = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    pizzaName: `P${String(index + 1)}`,
    quantity: 1,
  }));

describe("summarizeOrderItems", () => {
  it.each([
    [0, ""],
    [1, "P1 ×1"],
    [3, "P1 ×1, P2 ×1, P3 ×1"],
    [4, "P1 ×1, P2 ×1, P3 ×1 +1 more"],
    [6, "P1 ×1, P2 ×1, P3 ×1 +3 more"],
  ])("summarises %i items", (count, expected) => {
    expect(summarizeOrderItems(items(count))).toBe(expected);
  });

  it("includes the quantities", () => {
    expect(summarizeOrderItems([{ pizzaName: "Diavola", quantity: 3 }])).toBe("Diavola ×3");
  });
});

describe("isFinalOrderStatus", () => {
  it("treats only completed and cancelled as final", () => {
    expect(ORDER_STATUSES.filter((status) => isFinalOrderStatus(status))).toEqual([
      "completed",
      "cancelled",
    ]);
  });
});

const statesFor = (delivery: DeliveryType, status: OrderStatus): ProgressStepState[] =>
  getProgressSteps(delivery).map((step) => getStepState(step, status));

describe("getProgressSteps", () => {
  it("has five steps for delivery ending in Delivered", () => {
    expect(getProgressSteps(DeliveryType.DELIVERY)).toEqual([
      { status: "confirmed", label: "Confirmed" },
      { status: "preparing", label: "Preparing" },
      { status: "ready_for_delivery", label: "Ready" },
      { status: "delivering", label: "Out for delivery" },
      { status: "completed", label: "Delivered" },
    ]);
  });

  it("skips Out for delivery for pickup and ends in Picked up", () => {
    expect(getProgressSteps(DeliveryType.PICKUP)).toEqual([
      { status: "confirmed", label: "Confirmed" },
      { status: "preparing", label: "Preparing" },
      { status: "ready_for_delivery", label: "Ready for pickup" },
      { status: "completed", label: "Picked up" },
    ]);
  });
});

describe("getStepState", () => {
  it.each<[OrderStatus, ProgressStepState[]]>([
    ["pending", ["upcoming", "upcoming", "upcoming", "upcoming", "upcoming"]],
    ["confirmed", ["current", "upcoming", "upcoming", "upcoming", "upcoming"]],
    ["preparing", ["done", "current", "upcoming", "upcoming", "upcoming"]],
    ["ready_for_delivery", ["done", "done", "current", "upcoming", "upcoming"]],
    ["delivering", ["done", "done", "done", "current", "upcoming"]],
    ["completed", ["done", "done", "done", "done", "done"]],
    ["cancelled", ["upcoming", "upcoming", "upcoming", "upcoming", "upcoming"]],
  ])("maps the delivery steps for %s", (status, expected) => {
    expect(statesFor(DeliveryType.DELIVERY, status)).toEqual(expected);
  });

  it.each<[OrderStatus, ProgressStepState[]]>([
    ["pending", ["upcoming", "upcoming", "upcoming", "upcoming"]],
    ["ready_for_delivery", ["done", "done", "current", "upcoming"]],
    ["delivering", ["done", "done", "done", "upcoming"]],
    ["completed", ["done", "done", "done", "done"]],
  ])("maps the pickup steps for %s", (status, expected) => {
    expect(statesFor(DeliveryType.PICKUP, status)).toEqual(expected);
  });
});

describe("getNextStatuses", () => {
  it.each<[OrderStatus, NextOrderStatus[], NextOrderStatus[]]>([
    ["pending", ["confirmed", "cancelled"], ["confirmed", "cancelled"]],
    ["confirmed", ["preparing", "cancelled"], ["preparing", "cancelled"]],
    ["preparing", ["ready_for_delivery"], ["ready_for_delivery"]],
    ["ready_for_delivery", ["delivering"], ["completed"]],
    ["delivering", ["completed"], ["completed"]],
    ["completed", [], []],
    ["cancelled", [], []],
  ])("moves %s to %j for delivery and %j for pickup", (status, forDelivery, forPickup) => {
    expect(getNextStatuses(status, DeliveryType.DELIVERY)).toEqual(forDelivery);
    expect(getNextStatuses(status, DeliveryType.PICKUP)).toEqual(forPickup);
  });
});

describe("getStatusActionLabel", () => {
  it.each<[NextOrderStatus, string, string]>([
    ["confirmed", "Mark as confirmed", "Mark as confirmed"],
    ["preparing", "Mark as preparing", "Mark as preparing"],
    ["ready_for_delivery", "Mark as ready", "Mark as ready for pickup"],
    ["delivering", "Mark as delivering", "Mark as delivering"],
    ["completed", "Mark as delivered", "Mark as picked up"],
    ["cancelled", "Mark as cancelled", "Mark as cancelled"],
  ])("labels %s as %s / %s", (status, deliveryLabel, pickupLabel) => {
    expect(getStatusActionLabel(status, DeliveryType.DELIVERY)).toBe(deliveryLabel);
    expect(getStatusActionLabel(status, DeliveryType.PICKUP)).toBe(pickupLabel);
  });
});
