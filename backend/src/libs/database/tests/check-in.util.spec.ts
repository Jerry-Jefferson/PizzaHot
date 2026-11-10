import { describe, it, expect } from "@jest/globals";
import { checkIn, checkName } from "../check-in.util.ts";

describe("checkIn", () => {
  it("quotes the column and every value", () => {
    expect(checkIn("status", ["pending", "confirmed"])).toBe(
      `"status" IN ('pending', 'confirmed')`
    );
  });

  it("handles a single value", () => {
    expect(checkIn("role", ["admin"])).toBe(`"role" IN ('admin')`);
  });

  it("keeps every value of a longer list", () => {
    const statuses = ["pending", "confirmed", "preparing", "delivering", "completed"];

    const sql = checkIn("status", statuses);

    for (const status of statuses) {
      expect(sql).toContain(`'${status}'`);
    }
    expect(sql.startsWith(`"status" IN (`)).toBe(true);
  });
});

describe("checkName", () => {
  it("builds a constraint name from the table and column", () => {
    expect(checkName("orders", "status")).toBe("CHK_orders_status");
  });
});
