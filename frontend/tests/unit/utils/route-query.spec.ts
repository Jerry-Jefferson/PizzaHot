import { describe, expect, it } from "vitest";

import {
  firstQueryValue,
  parseEnumQuery,
  parseMonthQuery,
  parsePageQuery,
  startOfMonth,
  toMonthQuery,
} from "@/utils/route-query";

describe("firstQueryValue", () => {
  it.each([
    ["pizza", "pizza"],
    [["first", "second"], "first"],
    [[], ""],
    [null, ""],
    [undefined, ""],
  ])("reads %j as %j", (value, expected) => {
    expect(firstQueryValue(value)).toBe(expected);
  });
});

describe("parsePageQuery", () => {
  it.each([
    ["3", 3],
    ["1", 1],
    ["0", 1],
    ["-2", 1],
    ["2.5", 1],
    ["abc", 1],
    [undefined, 1],
  ])("reads %j as page %i", (value, expected) => {
    expect(parsePageQuery(value)).toBe(expected);
  });
});

describe("parseEnumQuery", () => {
  const SIZES = ["small", "large"] as const;

  it("keeps an allowed value", () => {
    expect(parseEnumQuery("large", SIZES)).toBe("large");
  });

  it.each(["medium", "", undefined])("drops %j", (value) => {
    expect(parseEnumQuery(value, SIZES)).toBe("");
  });
});

describe("month query", () => {
  const NOW = new Date(2026, 10, 18, 15, 30);

  it("starts a month on its first day at midnight", () => {
    expect(startOfMonth(NOW)).toEqual(new Date(2026, 10, 1));
  });

  it.each([
    [new Date(2026, 0, 15), "2026-01"],
    [new Date(2025, 11, 31), "2025-12"],
  ])("writes %s as %s", (date, expected) => {
    expect(toMonthQuery(date)).toBe(expected);
  });

  it("reads a past month", () => {
    expect(parseMonthQuery("2026-03", NOW)).toEqual(new Date(2026, 2, 1));
  });

  it.each([undefined, "", "2026-3", "2026-13", "2026-00", "1999-12", "march", "2027-01"])(
    "falls back to the current month for %j",
    (value) => {
      expect(parseMonthQuery(value, NOW)).toEqual(new Date(2026, 10, 1));
    }
  );
});
