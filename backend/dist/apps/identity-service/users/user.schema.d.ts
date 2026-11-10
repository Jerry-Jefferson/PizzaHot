import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    surname: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<{
        readonly MALE: "male";
        readonly FEMALE: "female";
    }>>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    surname: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    gender: z.ZodDefault<z.ZodNullable<z.ZodEnum<{
        readonly MALE: "male";
        readonly FEMALE: "female";
    }>>>;
}, z.core.$strip>;
export declare const updateUserRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        user: "user";
        admin: "admin";
    }>;
}, z.core.$strip>;
export declare const listUsersQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
