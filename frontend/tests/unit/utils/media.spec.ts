import { describe, expect, it } from "vitest";

import { MAX_IMAGE_BYTES } from "@/utils/constants/limits.constants";
import {
  getImageFileError,
  IMAGE_TOO_LARGE_MESSAGE,
  INVALID_IMAGE_TYPE_MESSAGE,
  MEDIA_PLACEHOLDER_URL,
  toMediaUrl,
} from "@/utils/media";

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

describe("getImageFileError", () => {
  const fileOf = (type: string, size = 1024) => {
    const file = new File(["x"], "pizza", { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
  };

  it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s", (type) => {
    expect(getImageFileError(fileOf(type))).toBeNull();
  });

  it.each(["image/gif", "image/svg+xml", "application/pdf", ""])("rejects the type %j", (type) => {
    expect(getImageFileError(fileOf(type))).toBe(INVALID_IMAGE_TYPE_MESSAGE);
  });

  it("accepts exactly 5 MB and rejects anything larger", () => {
    expect(getImageFileError(fileOf("image/png", MAX_IMAGE_BYTES))).toBeNull();
    expect(getImageFileError(fileOf("image/png", MAX_IMAGE_BYTES + 1))).toBe(
      IMAGE_TOO_LARGE_MESSAGE
    );
  });
});
