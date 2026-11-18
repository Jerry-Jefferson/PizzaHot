import { describe, expect, it } from "vitest";

import {
  formatDiscount,
  getPromocodeState,
  startOfTomorrow,
  toExpiryDay,
  toExpiryTimestamp,
} from "@/utils/promocode";

const NOW = new Date(2026, 10, 18, 15, 30);

describe("getPromocodeState", () => {
  it("is active before the expiry date", () => {
    const validTill = new Date(2026, 11, 1).toISOString();

    expect(getPromocodeState({ deletedAt: null, validTill }, NOW)).toBe("active");
  });

  it("is expired after the expiry date", () => {
    const validTill = new Date(2026, 10, 18, 9).toISOString();

    expect(getPromocodeState({ deletedAt: null, validTill }, NOW)).toBe("expired");
  });

  it("is inactive once switched off, even if it has also expired", () => {
    const validTill = new Date(2026, 0, 1).toISOString();

    expect(getPromocodeState({ deletedAt: "2026-11-01T00:00:00.000Z", validTill }, NOW)).toBe(
      "inactive"
    );
  });
});

describe("formatDiscount", () => {
  it.each([
    [{ discount: 20, discountMode: "percentage" as const }, "20% off"],
    [{ discount: 10, discountMode: "fixed_amount" as const }, "$10 off"],
  ])("formats %j as %s", (promocode, expected) => {
    expect(formatDiscount(promocode)).toBe(expected);
  });
});

describe("expiry dates", () => {
  it("starts tomorrow at local midnight", () => {
    expect(startOfTomorrow(NOW)).toEqual(new Date(2026, 10, 19));
  });

  it("lets a code expire at the end of the chosen day", () => {
    expect(toExpiryTimestamp(new Date(2026, 11, 31))).toBe(
      new Date(2026, 11, 31, 23, 59, 59, 999).toISOString()
    );
  });

  it("reads the expiry day back from a timestamp", () => {
    expect(toExpiryDay(new Date(2026, 11, 31, 23, 59, 59, 999).toISOString())).toEqual(
      new Date(2026, 11, 31)
    );
  });
});
