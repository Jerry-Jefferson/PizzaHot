import { describe, expect, it } from "vitest";

import { DeliveryType, type OrderStatus } from "@/types/order.types";
import {
  getProgressSteps,
  getStepState,
  type ProgressStepState,
} from "@/utils/constants/order-progress";

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
