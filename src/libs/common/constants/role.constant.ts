export const Role = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
