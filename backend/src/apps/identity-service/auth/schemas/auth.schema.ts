import { z } from "zod";
import { emailSchema } from "./email.schema.ts";
import { passwordSchema } from "./password.schema.ts";
import { personNameSchema } from "./person-name.schema.ts";
import { Gender } from "../../users/constants/gender.constant.ts";

export const signupSchema = z
  .object({
    name: personNameSchema("Name").optional(),
    surname: personNameSchema("Surname").optional(),
    email: emailSchema,
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

export type SignUp = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

export type LogIn = z.infer<typeof loginSchema>;
