import type { AuthResponse, SignInPayload, SignUpPayload } from "@/types/auth.types";
import type { User } from "@/types/user.types";

import { apiClient } from ".";

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload);
  return data;
}

export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function me(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function signOut(): Promise<void> {
  await apiClient.post("/auth/logout");
}
