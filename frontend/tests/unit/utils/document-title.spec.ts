import { describe, expect, it } from "vitest";

import { formatDocumentTitle } from "@/utils/document-title";

describe("formatDocumentTitle", () => {
  it.each([
    ["Checkout", "Checkout · Pizzeria"],
    ["  Margherita ", "Margherita · Pizzeria"],
    ["", "Pizzeria"],
    [undefined, "Pizzeria"],
    [null, "Pizzeria"],
  ])("formats %j as %j", (title, expected) => {
    expect(formatDocumentTitle(title)).toBe(expected);
  });
});
