import { z } from "zod";
import { Gender } from "./constants/gender.constant.js";
import { paginationSchema } from "../../../libs/pagination/pagination.schema.js";
import { ROLES } from "../../../libs/auth/auth.constant.js";
export const createUserSchema = z.object({
    email: z
        .email({ error: "Invalid email format" })
        .max(255, { message: "Email must be at most 255 characters" }),
    password: z
        .string({ error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(128, { message: "Password must be at most 128 characters" }),
    name: z
        .string({ error: "Name must be a string" })
        .min(1, { message: "Name must not be empty" })
        .max(100, { message: "Name must be at most 100 characters" })
        .trim()
        .optional(),
    surname: z
        .string({ error: "Surname must be a string" })
        .min(1, { message: "Surname must not be empty" })
        .max(100, { message: "Surname must be at most 100 characters" })
        .trim()
        .optional(),
    gender: z
        .enum(Gender, {
        error: `Gender must be one of: ${Object.values(Gender).join(", ")}`,
    })
        .optional(),
});
export const updateUserSchema = z.object({
    name: z
        .string({ error: "Name must be a string" })
        .min(1, { message: "Name must not be empty" })
        .max(100, { message: "Name must be at most 100 characters" })
        .trim()
        .nullable()
        .default(null),
    surname: z
        .string({ error: "Surname must be a string" })
        .min(1, { message: "Surname must not be empty" })
        .max(100, { message: "Surname must be at most 100 characters" })
        .trim()
        .nullable()
        .default(null),
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
});
export const changePasswordSchema = z
    .object({
    currentPassword: z
        .string({ error: "Current password is required" })
        .min(8, { message: "Current password must be at least 8 characters" })
        .max(128, { message: "Current password must be at most 128 characters" }),
    newPassword: z
        .string({ error: "New password is required" })
        .min(8, { message: "New password must be at least 8 characters" })
        .max(128, { message: "New password must be at most 128 characters" }),
})
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
});
//# sourceMappingURL=user.schema.js.map