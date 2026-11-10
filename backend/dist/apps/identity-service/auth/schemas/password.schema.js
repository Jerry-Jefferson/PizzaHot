import { z } from "zod";
export const passwordSchema = z
    .string({ error: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" })
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
//# sourceMappingURL=password.schema.js.map