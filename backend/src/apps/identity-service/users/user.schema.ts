import { z } from "zod";
import { Gender } from "./constants/gender.constant.ts";
import { emailSchema } from "../auth/schemas/email.schema.ts";
import { passwordSchema } from "../auth/schemas/password.schema.ts";
import { personNameSchema } from "../auth/schemas/person-name.schema.ts";
import { paginationSchema } from "../../../libs/pagination/pagination.schema.ts";
import { ROLES } from "../../../libs/auth/auth.constant.ts";

export const createUserSchema = z.object({
  email: emailSchema,

  password: passwordSchema,

  name: personNameSchema("Name").optional(),

  surname: personNameSchema("Surname").optional(),

  gender: z
    .enum(Gender, {
      error: `Gender must be one of: ${Object.values(Gender).join(", ")}`,
    })
    .optional(),
});

export const updateUserSchema = z.object({
  name: personNameSchema("Name").nullable().default(null),

  surname: personNameSchema("Surname").nullable().default(null),

  gender: z
    .enum(Gender, {
      error: `Gender must be one of: ${Object.values(Gender).join(", ")}`,
    })
    .nullable()
    .default(null),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(ROLES, { error: `Role must be one of: ${ROLES.join(", ")}` }),
});

export const listUsersQuerySchema = paginationSchema.extend({
  search: z.string({ error: "Search must be a string" }).optional(),
  role: z.enum(ROLES, { error: `Role must be one of: ${ROLES.join(", ")}` }).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Current password is required" })
      .min(1, { message: "Current password is required" }),

    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });
