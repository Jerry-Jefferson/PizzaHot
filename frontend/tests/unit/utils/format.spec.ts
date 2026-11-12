import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime, formatMonthYear, formatPrice, shortId } from "@/utils/format";

describe("formatPrice", () => {
  it.each([
    [9.99, "$9.99"],
    [12, "$12.00"],
    [1234.5, "$1,234.50"],
    [0, "$0.00"],
    ["13.9", "$13.90"],
  ])("formats %j as %s", (value, expected) => {
    expect(formatPrice(value)).toBe(expected);
  });
});

describe("formatMonthYear", () => {
  it("formats a date as short month and year", () => {
    expect(formatMonthYear(new Date(2024, 2, 15))).toBe("Mar 2024");
  });
});

describe("formatDate", () => {
  it("formats a date as a short month, day and year", () => {
    expect(formatDate(new Date(2026, 10, 11, 15, 5))).toBe("Nov 11, 2026");
  });

  it("accepts an ISO string", () => {
    expect(formatDate(new Date(2026, 0, 2).toISOString())).toBe("Jan 2, 2026");
  });
});

describe("formatDateTime", () => {
  it("adds the time", () => {
    expect(formatDateTime(new Date(2026, 10, 11, 15, 5))).toBe("Nov 11, 2026, 3:05 PM");
  });
});

describe("shortId", () => {
  it("returns # and the first 8 characters", () => {
    expect(shortId("3f2a9c1e-7b4d-4e8a-9c2f-1a2b3c4d5e6f")).toBe("#3f2a9c1e");
  });
});
