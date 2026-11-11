import { describe, expect, it } from "vitest";

import { getPageItems } from "@/utils/pagination";

describe("getPageItems", () => {
  it.each([
    [1, 0, []],
    [1, 1, [1]],
    [4, 7, [1, 2, 3, 4, 5, 6, 7]],
  ])("lists every page when there are few (page %i of %i)", (page, total, expected) => {
    expect(getPageItems(page, total)).toEqual(expected);
  });

  it.each([
    [1, 10, [1, 2, 3, 4, "end-ellipsis", 10]],
    [3, 10, [1, 2, 3, 4, "end-ellipsis", 10]],
    [5, 10, [1, "start-ellipsis", 4, 5, 6, "end-ellipsis", 10]],
    [8, 10, [1, "start-ellipsis", 7, 8, 9, 10]],
    [10, 10, [1, "start-ellipsis", 7, 8, 9, 10]],
  ])("collapses distant pages (page %i of %i)", (page, total, expected) => {
    expect(getPageItems(page, total)).toEqual(expected);
  });

  it("clamps an out-of-range page", () => {
    expect(getPageItems(99, 10)).toEqual(getPageItems(10, 10));
  });
});
