import { describe, expect, it } from "vitest";

import type { User } from "@/types/user.types";
import { getHomeRoute, getPostSignInRoute, getSafeRedirect } from "@/utils/auth-redirect";

const user = (role: User["role"]): User => ({
  id: "u1",
  role,
  email: "mario@x.io",
  name: "Mario",
  surname: "Rossi",
  gender: null,
  image: null,
  isEmailVerified: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const CUSTOMER = user("user");
const ADMIN = user("admin");

describe("getHomeRoute", () => {
  it.each([
    [CUSTOMER, "menu"],
    [ADMIN, "admin-dashboard"],
  ])("routes by role", (signedIn, name) => {
    expect(getHomeRoute(signedIn)).toEqual({ name });
  });
});

describe("getSafeRedirect", () => {
  it.each(["/cart", "/my-orders/abc?tab=items", "/admin/pizzas#top"])(
    "accepts the internal path %s",
    (path) => {
      expect(getSafeRedirect(path)).toBe(path);
    }
  );

  it.each([
    undefined,
    null,
    "",
    ["/cart"],
    "cart",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
  ])("rejects %o", (redirect) => {
    expect(getSafeRedirect(redirect)).toBeNull();
  });
});

describe("getPostSignInRoute", () => {
  it("prefers a safe redirect", () => {
    expect(getPostSignInRoute(CUSTOMER, "/checkout")).toBe("/checkout");
  });

  it.each([
    [CUSTOMER, "menu"],
    [ADMIN, "admin-dashboard"],
  ])("falls back to the home route by role", (signedIn, name) => {
    expect(getPostSignInRoute(signedIn, "//evil.example")).toEqual({ name });
  });
});
