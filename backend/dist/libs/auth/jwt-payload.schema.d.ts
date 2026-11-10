import { z } from "zod";
export declare const jwtPayloadSchema: z.ZodObject<{
    sub: z.ZodUUID;
    email: z.ZodEmail;
    role: z.ZodEnum<{
        readonly USER: "user";
        readonly ADMIN: "admin";
    }>;
    isEmailVerified: z.ZodBoolean;
}, z.core.$strip>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
