import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/plugins/vue-query";
import router from "@/router";
import { ApiError } from "@/services/errors";
import { handleSessionExpired, handleUnauthorized, normalizeError } from "@/services/interceptors";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";

vi.mock("@/router", async () => {
  const { createMemoryHistory, createRouter } = await import("vue-router");
  const { routes } = await import("@/router/routes");
  return { default: createRouter({ history: createMemoryHistory(), routes }) };
});

const CUSTOMER: User = {
  id: "u1",
  role: "user",
  email: "mario@x.io",
  name: "Mario",
  surname: "Rossi",
  gender: null,
  image: null,
  isEmailVerified: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const errorWithStatus = (status: number, url: string): AxiosError =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", { ...config, url }, null, {
    data: { statusCode: status },
    status,
    statusText: "",
    headers: {},
    config,
  });

async function openAs(signedIn: User | null, path: string): Promise<void> {
  if (signedIn) {
    useAuthStore().setUser(signedIn);
  }
  await router.push(path);
}

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleSessionExpired", () => {
  it("clears the session and sends the user to sign-in with a redirect back", async () => {
    await openAs(CUSTOMER, "/my-orders");
    const clear = vi.spyOn(queryClient, "clear");

    await handleSessionExpired();

    expect(useAuthStore().user).toBeNull();
    expect(clear).toHaveBeenCalledOnce();
    expect(router.currentRoute.value.name).toBe("sign-in");
    expect(router.currentRoute.value.query.redirect).toBe("/my-orders");
  });

  it("stays on a guest-only page", async () => {
    await openAs(null, "/sign-up");

    await handleSessionExpired();

    expect(router.currentRoute.value.fullPath).toBe("/sign-up");
  });
});

describe("handleUnauthorized", () => {
  it("expires the session on 401 and still rejects", async () => {
    await openAs(CUSTOMER, "/cart");
    const error = errorWithStatus(401, "/carts");

    await expect(handleUnauthorized(error)).rejects.toBe(error);
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("sign-in");
    });
    expect(useAuthStore().user).toBeNull();
  });

  it.each(["/auth/me", "/auth/login", "/auth/logout", "/users/me/password"])(
    "keeps the session for a 401 from %s",
    async (path) => {
      await openAs(CUSTOMER, "/cart");

      await expect(handleUnauthorized(errorWithStatus(401, path))).rejects.toBeInstanceOf(
        AxiosError
      );

      expect(useAuthStore().user).toEqual(CUSTOMER);
      expect(router.currentRoute.value.fullPath).toBe("/cart");
    }
  );

  it("ignores other error statuses", async () => {
    await openAs(CUSTOMER, "/cart");

    await expect(handleUnauthorized(errorWithStatus(403, "/users"))).rejects.toBeInstanceOf(
      AxiosError
    );

    expect(useAuthStore().user).toEqual(CUSTOMER);
  });

  it("wraps a non-Error rejection in an Error", async () => {
    await expect(handleUnauthorized("boom")).rejects.toThrow("boom");
  });
});

describe("normalizeError", () => {
  it("rejects with an ApiError built from the response", async () => {
    await expect(normalizeError(errorWithStatus(404, "/pizzas/1"))).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
    });
    await expect(normalizeError(errorWithStatus(404, "/pizzas/1"))).rejects.toBeInstanceOf(
      ApiError
    );
  });

  it("passes other errors through", async () => {
    const error = new Error("boom");

    await expect(normalizeError(error)).rejects.toBe(error);
  });

  it("wraps a non-Error rejection in an Error", async () => {
    await expect(normalizeError("boom")).rejects.toThrow("boom");
  });
});
