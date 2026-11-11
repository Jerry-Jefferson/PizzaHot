import type { Gender, User } from "./user.types";

export type AuthStatus = "idle" | "loading" | "ready";

export interface SignInPayload {
  email: string;
  password: string;
}

export type SignInField = keyof SignInPayload;

export type SignInErrors = Partial<Record<SignInField, string>>;

export interface SignUpPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  surname?: string;
  gender?: Gender;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
