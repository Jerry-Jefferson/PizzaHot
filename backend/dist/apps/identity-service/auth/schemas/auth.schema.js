import { z } from "zod";
import { passwordSchema } from "./password.schema.js";
import { Gender } from "../../users/constants/gender.constant.js";
export const signupSchema = z
    .object({
    name: z.string({ error: "Name must be a string" }).optional(),
    surname: z.string({ error: "Surname must be a string" }).optional(),
    email: z.email({ error: "Invalid email format" }),
    gender: z
        .enum(Gender, {
        error: `Gender must be one of: ${Object.values(Gender).join(", ")}`,
    })
        .optional(),
    password: passwordSchema,
    confirmPassword: z.string({ error: "Password confirmation is required" }),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})
    .transform(({ confirmPassword: _, ...rest }) => rest);
export const loginSchema = z.object({
    email: z.email({ error: "Invalid email format" }),
    password: z.string().min(1, { message: "Password is required" }),
});
//# sourceMappingURL=auth.schema.js.map