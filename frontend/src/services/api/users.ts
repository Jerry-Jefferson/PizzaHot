import type { Paginated } from "@/types/pagination.types";
import type {
  ChangePasswordPayload,
  UpdateMePayload,
  User,
  UserListQuery,
} from "@/types/user.types";

import { apiClient } from "..";

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

export async function listUsers(query: UserListQuery = {}): Promise<Paginated<User>> {
  const { data } = await apiClient.get<Paginated<User>>("/users", { params: query });
  return data;
}

export async function getUser(id: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/users/${id}`);
  return data;
}
