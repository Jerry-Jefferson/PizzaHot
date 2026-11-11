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

export interface SignUpFormValues {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type SignUpField = keyof SignUpFormValues;

export type SignUpErrors = Partial<Record<SignUpField, string>>;

export interface SignUpFormExpose {
  focusField: (field: SignUpField) => void;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
