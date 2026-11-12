import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/api";
import { changePassword, deleteMe, updateMe } from "@/api/users";
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
});
