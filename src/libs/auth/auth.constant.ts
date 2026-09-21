export const IS_PUBLIC_KEY = "isPublic";
export const COOKIE_NAME = "access_token";
export const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const Role = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES = [Role.USER, Role.ADMIN] as const;
