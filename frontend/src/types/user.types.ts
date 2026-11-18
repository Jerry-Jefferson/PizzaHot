import type { FormErrors } from "./form.types";
import type { PaginationQuery } from "./pagination.types";

export const Role = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const Gender = {
  MALE: "male",
  FEMALE: "female",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export interface User {
  id: string;
  role: Role;
  email: string;
  name: string | null;
  surname: string | null;
  gender: Gender | null;
  image: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserSummary = Pick<User, "name" | "surname" | "email" | "image">;

export interface UserListQuery extends PaginationQuery {
  search?: string;
  role?: Role;
}

export interface UpdateMePayload {
  name: string | null;
  surname: string | null;
  gender: Gender | null;
}

export interface PersonalInfoFormValues {
  name: string;
  surname: string;
  gender: Gender | "";
}

export type PersonalInfoField = keyof PersonalInfoFormValues;

export type PersonalInfoErrors = FormErrors<PersonalInfoField>;

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordFormValues extends ChangePasswordPayload {
  confirmPassword: string;
}

export type ChangePasswordField = keyof ChangePasswordFormValues;

export type ChangePasswordErrors = FormErrors<ChangePasswordField>;
