import { z } from "zod";

export const EMAIL_MAX_LENGTH = 255;

export const emailSchema = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .pipe(
    z.email({ error: "Invalid email format" }).max(EMAIL_MAX_LENGTH, {
      message: `Email must be at most ${String(EMAIL_MAX_LENGTH)} characters`,
    })
  );
