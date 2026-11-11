import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/api";
import { me, signIn, signOut, signUp } from "@/api/auth";
import type { AuthResponse } from "@/types/auth.types";
import type { User } from "@/types/user.types";

const USER = { id: "u1", email: "mario@x.io", role: "user" } as User;
const AUTH_RESPONSE: AuthResponse = { accessToken: "token", user: USER };

const response = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("auth api", () => {
  it("signs up through POST /auth/signup", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response(AUTH_RESPONSE));
    const payload = { email: "mario@x.io", password: "Secret1!", confirmPassword: "Secret1!" };

    await expect(signUp(payload)).resolves.toEqual(AUTH_RESPONSE);
    expect(post).toHaveBeenCalledWith("/auth/signup", payload);
  });

  it("signs in through POST /auth/login", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response(AUTH_RESPONSE));
    const payload = { email: "mario@x.io", password: "Secret1!" };

    await expect(signIn(payload)).resolves.toEqual(AUTH_RESPONSE);
    expect(post).toHaveBeenCalledWith("/auth/login", payload);
  });

  it("loads the current user from GET /auth/me", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(USER));

    await expect(me()).resolves.toEqual(USER);
    expect(get).toHaveBeenCalledWith("/auth/me");
  });

  it("signs out through POST /auth/logout", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response(undefined));

    await expect(signOut()).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith("/auth/logout");
  });
});
