import { describe, expect, it } from "vitest";

import { summarizeOrderItems } from "@/utils/order-items-summary";

const items = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ pizzaName: `P${String(index + 1)}`, quantity: 1 }));

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
