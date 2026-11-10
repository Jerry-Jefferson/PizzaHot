import { describe, it, expect } from "@jest/globals";
import { OrderStatus, ORDER_STATUSES } from "../constants/order-status.constant.ts";

describe("order status constants", () => {
  it("lists every declared status", () => {
    expect([...ORDER_STATUSES].sort()).toEqual(Object.values(OrderStatus).sort());
  });

  it("holds no duplicates", () => {
    expect(new Set(ORDER_STATUSES).size).toBe(ORDER_STATUSES.length);
  });
});
