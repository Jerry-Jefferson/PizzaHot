import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { routes } from "@/router/routes";

const router = createRouter({ history: createMemoryHistory(), routes });

const ADMIN_ROUTES = [
  "admin-dashboard",
  "admin-pizzas",
  "admin-pizza-new",
  "admin-pizza-edit",
  "admin-orders",
  "admin-users",
  "admin-promocodes",
  "admin-analytics",
  "admin-profile",
];

const metaOf = (name: string) => routes.find((route) => route.name === name)?.meta;

describe("routes", () => {
  it("defines every planned route name", () => {
    expect(routes.map((route) => route.name)).toEqual([
      "sign-in",
      "sign-up",
      "menu",
      "pizza-details",
      "cart",
      "checkout",
      "my-orders",
      "my-order-details",
      "profile",
      ...ADMIN_ROUTES,
      "not-found",
    ]);
  });

  it.each(routes.map((route) => [String(route.name), route] as const))(
    "lazy-loads the %s view",
    (_name, route) => {
      expect(typeof (route.component ?? route.components?.default)).toBe("function");
    }
  );

  it.each(["sign-in", "sign-up"])("lazy-loads the %s hero into the auth layout aside", (name) => {
    expect(typeof routes.find((route) => route.name === name)?.components?.aside).toBe("function");
  });

  it.each(["sign-in", "sign-up"])("%s is guest-only with the auth layout", (name) => {
    expect(metaOf(name)).toEqual({ layout: "auth", guestOnly: true });
  });

  it.each(["menu", "pizza-details", "not-found"])(
    "%s is public with the customer layout",
    (name) => {
      expect(metaOf(name)).toEqual({ layout: "customer" });
    }
  );

  it.each(["cart", "checkout", "my-orders", "my-order-details", "profile"])(
    "%s requires auth with the customer layout",
    (name) => {
      expect(metaOf(name)).toEqual({ layout: "customer", requiresAuth: true });
    }
  );

  it.each(ADMIN_ROUTES)("%s requires the admin role and has a title", (name) => {
    expect(metaOf(name)).toMatchObject({ layout: "admin", requiresAuth: true, role: "admin" });
    expect(metaOf(name)?.title).toEqual(expect.any(String));
  });

  it.each([
    ["/", "menu"],
    ["/pizzas/42", "pizza-details"],
    ["/my-orders/abc", "my-order-details"],
    ["/admin", "admin-dashboard"],
    ["/admin/pizzas/new", "admin-pizza-new"],
    ["/admin/pizzas/42/edit", "admin-pizza-edit"],
    ["/does/not/exist", "not-found"],
  ])("resolves %s to %s", (path, name) => {
    expect(router.resolve(path).name).toBe(name);
  });
});
