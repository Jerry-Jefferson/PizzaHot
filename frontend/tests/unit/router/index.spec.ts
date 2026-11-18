import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { applyDocumentTitle, authGuard } from "@/router";
import { routes } from "@/router/routes";
import * as authApi from "@/services/api/auth";
import { ApiError } from "@/services/errors";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";

vi.mock("@/services/api/auth", () => ({ me: vi.fn() }));

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

function setup(signedIn: User | null) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  router.beforeEach(authGuard);
  router.afterEach(applyDocumentTitle);
  if (signedIn) {
    vi.mocked(authApi.me).mockResolvedValue(signedIn);
  } else {
    vi.mocked(authApi.me).mockRejectedValue(new ApiError("Unauthorized", { status: 401 }));
  }
  return router;
}

async function landOn(signedIn: User | null, path: string) {
  const router = setup(signedIn);
  await router.push(path);
  return router.currentRoute.value;
}

beforeEach(() => {
  setActivePinia(createPinia());
  vi.resetAllMocks();
});

describe("route guards", () => {
  describe("session", () => {
    it("restores the session once, on the first navigation", async () => {
      const router = setup(CUSTOMER);

      await router.push("/cart");
      await router.push("/profile");

      expect(authApi.me).toHaveBeenCalledTimes(1);
      expect(useAuthStore().user).toEqual(CUSTOMER);
      expect(router.currentRoute.value.fullPath).toBe("/profile");
    });

    it("continues as a guest when the server is unreachable", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const router = setup(null);
      vi.mocked(authApi.me).mockRejectedValue(new ApiError("Network Error", { status: 0 }));

      await router.push("/cart");

      expect(router.currentRoute.value.name).toBe("sign-in");
      expect(useAuthStore().status).toBe("ready");
    });
  });

  describe("guest", () => {
    it.each(["/", "/pizzas/42", "/sign-in", "/sign-up", "/nowhere"])(
      "may open %s",
      async (path) => {
        expect((await landOn(null, path)).fullPath).toBe(path);
      }
    );

    it.each(["/cart", "/my-orders/abc?tab=items", "/admin/pizzas"])(
      "is sent to sign-in from %s with a redirect back",
      async (path) => {
        const route = await landOn(null, path);

        expect(route.name).toBe("sign-in");
        expect(route.query.redirect).toBe(path);
      }
    );
  });

  describe("customer", () => {
    it.each(["/", "/cart", "/checkout", "/my-orders", "/profile"])("may open %s", async (path) => {
      expect((await landOn(CUSTOMER, path)).fullPath).toBe(path);
    });

    it.each(["/sign-in", "/sign-up"])("is sent to the menu from %s", async (path) => {
      expect((await landOn(CUSTOMER, path)).name).toBe("menu");
    });

    it.each(["/admin", "/admin/orders", "/admin/pizzas/42/edit"])(
      "is sent to the menu from the admin page %s",
      async (path) => {
        expect((await landOn(CUSTOMER, path)).name).toBe("menu");
      }
    );
  });

  describe("admin", () => {
    it.each(["/admin", "/admin/users", "/", "/cart"])("may open %s", async (path) => {
      expect((await landOn(ADMIN, path)).fullPath).toBe(path);
    });

    it.each(["/sign-in", "/sign-up"])("is sent to the dashboard from %s", async (path) => {
      expect((await landOn(ADMIN, path)).name).toBe("admin-dashboard");
    });
  });
});

describe("document title", () => {
  it.each([
    [CUSTOMER, "/cart", "Cart · Pizzeria"],
    [CUSTOMER, "/does/not/exist", "Page not found · Pizzeria"],
    [ADMIN, "/admin/orders", "Orders · Pizzeria"],
    [null, "/checkout", "Sign in · Pizzeria"],
  ])("titles the page after the route it lands on", async (signedIn, path, title) => {
    await landOn(signedIn, path);

    expect(document.title).toBe(title);
  });
});
