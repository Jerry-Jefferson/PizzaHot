import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
const BCRYPT_MAX_BYTES = 72;

export const passwordSchema = z
  .string({ error: "Password is required" })
  .min(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${String(PASSWORD_MIN_LENGTH)} characters`,
  })
  .max(PASSWORD_MAX_LENGTH, {
    message: `Password must be at most ${String(PASSWORD_MAX_LENGTH)} characters`,
  })
  .refine((val) => Buffer.byteLength(val, "utf8") <= BCRYPT_MAX_BYTES, {
    message: "Password is too long",
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((val) => /\d/.test(val), {
    message: "Password must contain at least one digit",
  })
  .refine((val) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(val), {
    message: "Password must contain at least one special character",
  });
