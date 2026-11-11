import { describe, expect, it } from "vitest";

import { MEDIA_PLACEHOLDER_URL, toMediaUrl } from "@/utils/media-url";

describe("toMediaUrl", () => {
  it.each([null, undefined, "", "   "])("returns the placeholder for %j", (path) => {
    expect(toMediaUrl(path)).toBe(MEDIA_PLACEHOLDER_URL);
  });

  it("keeps an uploads path same-origin", () => {
    expect(toMediaUrl("/uploads/pizzas/abc.jpg")).toBe("/uploads/pizzas/abc.jpg");
  });

  it("adds a missing leading slash", () => {
    expect(toMediaUrl("uploads/pizzas/abc.jpg")).toBe("/uploads/pizzas/abc.jpg");
  });

  it.each([
    "https://cdn.example.com/a.png",
    "blob:http://localhost/123",
    "data:image/png;base64,AA",
  ])("returns an absolute URL unchanged: %s", (url) => {
    expect(toMediaUrl(url)).toBe(url);
  });

  it("points the placeholder at an SVG image", () => {
    expect(MEDIA_PLACEHOLDER_URL).toMatch(/^data:image\/svg\+xml|\.svg$/);
  });
});
