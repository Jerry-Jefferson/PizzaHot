import { describe, it, expect } from "@jest/globals";
import { OrderStatus, ORDER_STATUSES } from "../constants/order-status.constant.ts";

describe("order status constants", () => {
  // Two shapes of the same list: the object is what code reads, the array is what zod and the
  // CHECK constraint are built from. Nothing makes them agree except this test.
  it("lists every declared status", () => {
    expect([...ORDER_STATUSES].sort()).toEqual(Object.values(OrderStatus).sort());
  });

  it("holds no duplicates", () => {
    expect(new Set(ORDER_STATUSES).size).toBe(ORDER_STATUSES.length);
  });
});
