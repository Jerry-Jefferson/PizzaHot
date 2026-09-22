import { describe, it, expect } from "@jest/globals";
import { paginationSchema } from "../pagination.schema.ts";
import { PaginatedResponseDto } from "../paginated-response.dto.ts";

describe("paginationSchema", () => {
  it("fills in the first page of ten", () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 10 });
  });

  // Query strings are always text, so the schema has to coerce before it can validate.
  it("coerces numbers out of strings", () => {
    expect(paginationSchema.parse({ page: "3", limit: "25" })).toEqual({ page: 3, limit: 25 });
  });

  it.each([
    ["page below one", { page: 0 }],
    ["a fractional page", { page: 1.5 }],
    ["limit below one", { limit: 0 }],
    ["limit above one hundred", { limit: 101 }],
    ["text that is not a number", { page: "many" }],
  ])("refuses %s", (_label, input) => {
    expect(paginationSchema.safeParse(input).success).toBe(false);
  });

  it("accepts the largest allowed page size", () => {
    expect(paginationSchema.parse({ limit: 100 })).toMatchObject({ limit: 100 });
  });
});

describe("PaginatedResponseDto", () => {
  it("works out how many pages there are", () => {
    expect(new PaginatedResponseDto([], 1, 10, 42)).toMatchObject({ totalPages: 5 });
  });

  it("reports no pages for an empty set", () => {
    expect(new PaginatedResponseDto([], 1, 10, 0).totalPages).toBe(0);
  });

  it("counts a partial page as a page", () => {
    expect(new PaginatedResponseDto([], 1, 10, 11).totalPages).toBe(2);
  });

  it("keeps the rows it was given", () => {
    const rows = [{ id: "1" }, { id: "2" }];

    expect(new PaginatedResponseDto(rows, 2, 2, 4).data).toBe(rows);
  });
});
