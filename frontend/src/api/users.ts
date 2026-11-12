import type { ChangePasswordPayload, UpdateMePayload, User } from "@/types/user.types";

import { apiClient } from ".";

export async function updateMe(payload: UpdateMePayload): Promise<User> {
  const { data } = await apiClient.put<User>("/users/me", payload);
  return data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.patch("/users/me/password", payload);
}

export async function deleteMe(): Promise<void> {
  await apiClient.delete("/users/me");
}
