import { mount } from "@vue/test-utils";
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import * as authApi from "@/api/auth";
import { useRefreshSession } from "@/composables/useRefreshSession";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";

vi.mock("@/api/auth", () => ({ me: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }));

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

const user = (isEmailVerified: boolean) =>
  ({ id: "u1", role: "user", email: "mario@x.io", isEmailVerified }) as User;

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const httpError = (status: number) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data: { statusCode: status, message: "Failed" },
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

async function setup() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useAuthStore().setUser(user(false));
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/cart");

  let result!: ReturnType<typeof useRefreshSession>;
  mount(
    defineComponent({
      setup: () => {
        result = useRefreshSession();
        return () => null;
      },
    }),
    { global: { plugins: [pinia, router] } }
  );
  return { router, ...result };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useRefreshSession", () => {
  it("confirms a newly verified email", async () => {
    vi.mocked(authApi.me).mockResolvedValue(user(true));
    const { refreshSession, isRefreshing } = await setup();

    const pending = refreshSession();
    expect(isRefreshing.value).toBe(true);
    await pending;

    expect(useAuthStore().isEmailVerified).toBe(true);
    expect(isRefreshing.value).toBe(false);
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Email verified" })
    );
  });

  it("stays quiet when the email is still unverified", async () => {
    vi.mocked(authApi.me).mockResolvedValue(user(false));
    const { refreshSession } = await setup();

    await refreshSession();

    expect(toastAdd).not.toHaveBeenCalled();
  });

  it("sends the user to sign-in when the session has expired", async () => {
    vi.mocked(authApi.me).mockRejectedValue(httpError(401));
    const { refreshSession, router } = await setup();

    await refreshSession();

    expect(router.currentRoute.value.name).toBe("sign-in");
    expect(router.currentRoute.value.query.redirect).toBe("/cart");
  });

  it("keeps the user and shows an error when the request fails", async () => {
    vi.mocked(authApi.me).mockRejectedValue(httpError(500));
    const { refreshSession, router } = await setup();

    await refreshSession();

    expect(useAuthStore().user).toEqual(user(false));
    expect(router.currentRoute.value.name).toBe("cart");
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", summary: "Could not refresh your account" })
    );
  });
});
