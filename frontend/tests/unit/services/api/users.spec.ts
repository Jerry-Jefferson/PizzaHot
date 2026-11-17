import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/services";
import { changePassword, deleteMe, getUser, listUsers, updateMe } from "@/services/api/users";
import type { User } from "@/types/user.types";

const response = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("users api", () => {
  it("updates the profile through PUT /users/me", async () => {
    const user = { id: "u1" } as User;
    const put = vi.spyOn(apiClient, "put").mockResolvedValue(response(user));
    const payload = { name: "Mario", surname: null, gender: null };

    await expect(updateMe(payload)).resolves.toEqual(user);
    expect(put).toHaveBeenCalledWith("/users/me", payload);
  });

  it("changes the password through PATCH /users/me/password", async () => {
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue(response(undefined));
    const payload = { currentPassword: "OldSecret1!", newPassword: "NewSecret1!" };

    await expect(changePassword(payload)).resolves.toBeUndefined();
    expect(patch).toHaveBeenCalledWith("/users/me/password", payload);
  });

  it("deletes the account through DELETE /users/me", async () => {
    const remove = vi.spyOn(apiClient, "delete").mockResolvedValue(response(undefined));

    await expect(deleteMe()).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith("/users/me");
  });

  it("lists users through GET /users with pagination and search params", async () => {
    const page = { data: [], page: 1, limit: 1, total: 12, totalPages: 12 };
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(page));

    await expect(listUsers({ page: 1, limit: 1, search: "mar" })).resolves.toEqual(page);
    expect(get).toHaveBeenCalledWith("/users", { params: { page: 1, limit: 1, search: "mar" } });
  });

  it("gets one user through GET /users/:id", async () => {
    const user = { id: "u1" } as User;
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(user));

    await expect(getUser("u1")).resolves.toEqual(user);
    expect(get).toHaveBeenCalledWith("/users/u1");
  });
});
