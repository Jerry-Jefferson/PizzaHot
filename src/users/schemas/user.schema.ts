import { z } from "zod";
import { Gender } from "../constants/gender.enum.ts";
import { paginationSchema } from "../../shared/pagination/pagination.schema.ts";

export const createUserSchema = z.object({
  email: z
    .email({ error: "Invalid email format" })
    .max(255, { error: "Email must be at most 255 characters" }),

  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .max(128, { error: "Password must be at most 128 characters" }),

  name: z
    .string()
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name must be at most 100 characters" })
    .trim(),

  surname: z
    .string()
    .min(1, { error: "Surname is required" })
    .max(100, { error: "Surname must be at most 100 characters" })
    .trim(),

  gender: z.enum(Gender, {
    error: `Gender must be one of: ${Object.values(Gender).join(", ")}`,
  }),

  image: z.url({ error: "Image must be a valid URL" }).optional(),
});

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(1, { error: "Name must not be empty" })
      .max(100, { error: "Name must be at most 100 characters" })
      .trim()
      .optional(),

    surname: z
      .string()
      .min(1, { error: "Surname must not be empty" })
      .max(100, { error: "Surname must be at most 100 characters" })
      .trim()
      .optional(),

    gender: z
      .enum(Gender, {
        error: `Gender must be one of: ${Object.values(Gender).join(", ")}`,
      })
      .optional(),

    image: z.url({ error: "Image must be a valid URL" }).optional(),
  })
  .check((ctx) => {
    if (Object.keys(ctx.value).length === 0) {
      ctx.issues.push({
        code: "custom",
        message: "At least one field must be provided for update",
        input: ctx.value,
        path: [],
      });
    }
  });

export const listUsersQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { error: "Current password must be at least 8 characters" })
      .max(128, { error: "Current password must be at most 128 characters" }),

    newPassword: z
      .string()
      .min(8, { error: "New password must be at least 8 characters" })
      .max(128, { error: "New password must be at most 128 characters" }),
  })
  .check((ctx) => {
    if (ctx.value.currentPassword === ctx.value.newPassword) {
      ctx.issues.push({
        code: "custom",
        message: "New password must be different from the current password",
        input: ctx.value,
        path: ["newPassword"],
      });
    }
  });
