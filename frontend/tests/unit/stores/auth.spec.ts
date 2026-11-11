import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as authApi from "@/api/auth";
import { queryClient } from "@/plugins/vue-query";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";

vi.mock("@/api/auth", () => ({
  me: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

const user = (overrides: Partial<User> = {}): User => ({
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
  ...overrides,
});

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const httpError = (status: number): AxiosError =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data: { statusCode: status, message: "Failed" },
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

const CREDENTIALS = { email: "mario@x.io", password: "Secret1!" };

beforeEach(() => {
  setActivePinia(createPinia());
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe("auth store", () => {
  it("starts signed out and idle", () => {
    const auth = useAuthStore();

    expect(auth.user).toBeNull();
    expect(auth.status).toBe("idle");
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.isAdmin).toBe(false);
    expect(auth.isEmailVerified).toBe(false);
    expect(auth.initials).toBe("");
    expect(auth.displayName).toBe("");
  });

  describe("restoreSession", () => {
    it("stores the user from /auth/me", async () => {
      vi.mocked(authApi.me).mockResolvedValue(user());
      const auth = useAuthStore();

      const pending = auth.restoreSession();
      expect(auth.status).toBe("loading");
      await pending;

      expect(auth.user).toEqual(user());
      expect(auth.status).toBe("ready");
      expect(auth.isAuthenticated).toBe(true);
    });

    it("treats a 401 as a guest session", async () => {
      vi.mocked(authApi.me).mockRejectedValue(httpError(401));
      const auth = useAuthStore();
      auth.setUser(user());

      await auth.restoreSession();

      expect(auth.user).toBeNull();
      expect(auth.status).toBe("ready");
    });

    it("clears the user and re-throws other errors", async () => {
      const error = httpError(500);
      vi.mocked(authApi.me).mockRejectedValue(error);
      const auth = useAuthStore();
      auth.setUser(user());

      await expect(auth.restoreSession()).rejects.toBe(error);
      expect(auth.user).toBeNull();
      expect(auth.status).toBe("ready");
    });
  });

  it("stores the user after sign-in", async () => {
    vi.mocked(authApi.signIn).mockResolvedValue({ accessToken: "t", user: user() });
    const auth = useAuthStore();

    await expect(auth.signIn(CREDENTIALS)).resolves.toEqual(user());
    expect(authApi.signIn).toHaveBeenCalledWith(CREDENTIALS);
    expect(auth.user).toEqual(user());
  });

  it("stays signed out and re-throws when sign-in fails", async () => {
    const error = httpError(401);
    vi.mocked(authApi.signIn).mockRejectedValue(error);
    const auth = useAuthStore();

    await expect(auth.signIn(CREDENTIALS)).rejects.toBe(error);
    expect(auth.user).toBeNull();
  });

  it("stores the user after sign-up", async () => {
    vi.mocked(authApi.signUp).mockResolvedValue({ accessToken: "t", user: user() });
    const auth = useAuthStore();
    const payload = { ...CREDENTIALS, confirmPassword: CREDENTIALS.password };

    await expect(auth.signUp(payload)).resolves.toEqual(user());
    expect(authApi.signUp).toHaveBeenCalledWith(payload);
    expect(auth.user).toEqual(user());
  });

  describe("signOut", () => {
    it("clears the user and the query cache", async () => {
      vi.mocked(authApi.signOut).mockResolvedValue();
      const clear = vi.spyOn(queryClient, "clear");
      const auth = useAuthStore();
      auth.setUser(user());

      await auth.signOut();

      expect(auth.user).toBeNull();
      expect(clear).toHaveBeenCalledOnce();
    });

    it("still clears local state when the request fails", async () => {
      const error = httpError(500);
      vi.mocked(authApi.signOut).mockRejectedValue(error);
      const clear = vi.spyOn(queryClient, "clear");
      const auth = useAuthStore();
      auth.setUser(user());

      await expect(auth.signOut()).rejects.toBe(error);
      expect(auth.user).toBeNull();
      expect(clear).toHaveBeenCalledOnce();
    });
  });

  it.each([
    ["user", false],
    ["admin", true],
  ] as const)("isAdmin for the %s role is %s", (role, expected) => {
    const auth = useAuthStore();
    auth.setUser(user({ role }));

    expect(auth.isAdmin).toBe(expected);
  });

  it("reflects an unverified email", () => {
    const auth = useAuthStore();
    auth.setUser(user({ isEmailVerified: false }));

    expect(auth.isEmailVerified).toBe(false);
  });

  it.each([
    [{ name: "Mario", surname: "Rossi" }, "MR", "Mario Rossi"],
    [{ name: " Mario ", surname: null }, "M", "Mario"],
    [{ name: null, surname: null }, "M", "mario@x.io"],
  ])("derives initials and display name from %o", (names, initials, displayName) => {
    const auth = useAuthStore();
    auth.setUser(user(names));

    expect(auth.initials).toBe(initials);
    expect(auth.displayName).toBe(displayName);
  });

  it("reset signs the user out locally without calling the API", () => {
    const auth = useAuthStore();
    auth.setUser(user());

    auth.reset();

    expect(auth.user).toBeNull();
    expect(authApi.signOut).not.toHaveBeenCalled();
  });
});
