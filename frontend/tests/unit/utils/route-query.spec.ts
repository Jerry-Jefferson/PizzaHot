import { describe, expect, it } from "vitest";

import { firstQueryValue, parseEnumQuery, parsePageQuery } from "@/utils/route-query";

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
