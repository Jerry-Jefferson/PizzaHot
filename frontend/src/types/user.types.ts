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
