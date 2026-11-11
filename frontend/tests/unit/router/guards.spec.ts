import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { handleUnauthorized, setUnauthorizedHandler } from "@/api";
import { queryClient } from "@/plugins/vue-query";
import {
  getPostSignInRoute,
  getSafeRedirect,
  handleSessionExpired,
  installAuthGuards,
} from "@/router/guards";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";

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
  installAuthGuards(router);
  if (signedIn) {
    useAuthStore().setUser(signedIn);
  }
  return router;
}

async function landOn(signedIn: User | null, path: string) {
  const router = setup(signedIn);
  await router.push(path);
  return router.currentRoute.value;
}

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const unauthorized = (url: string): AxiosError =>
  new AxiosError("Unauthorized", "ERR_BAD_REQUEST", { ...config, url }, null, {
    data: { statusCode: 401, message: "Unauthorized" },
    status: 401,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  setUnauthorizedHandler(null);
  vi.restoreAllMocks();
});

describe("route guards", () => {
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

describe("session expiry", () => {
  it("clears the session and sends the user to sign-in with a redirect back", async () => {
    const router = setup(CUSTOMER);
    await router.push("/my-orders");
    const clear = vi.spyOn(queryClient, "clear");

    await handleSessionExpired(router);

    expect(useAuthStore().user).toBeNull();
    expect(clear).toHaveBeenCalledOnce();
    expect(router.currentRoute.value.name).toBe("sign-in");
    expect(router.currentRoute.value.query.redirect).toBe("/my-orders");
  });

  it("stays on a guest-only page", async () => {
    const router = setup(null);
    await router.push("/sign-up");

    await handleSessionExpired(router);

    expect(router.currentRoute.value.fullPath).toBe("/sign-up");
  });

  it("runs when an API request answers 401", async () => {
    const router = setup(CUSTOMER);
    await router.push("/cart");

    await handleUnauthorized(unauthorized("/carts")).catch(() => undefined);
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("sign-in");
    });

    expect(useAuthStore().user).toBeNull();
  });
});
