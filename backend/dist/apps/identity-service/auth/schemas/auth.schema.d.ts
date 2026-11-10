import { z } from "zod";
export declare const signupSchema: z.ZodPipe<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    surname: z.ZodOptional<z.ZodString>;
    email: z.ZodEmail;
    gender: z.ZodOptional<z.ZodEnum<{
        readonly MALE: "male";
        readonly FEMALE: "female";
    }>>;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>, z.ZodTransform<{
    email: string;
    password: string;
    name?: string;
    surname?: string;
    gender?: "male" | "female";
}, {
    email: string;
    password: string;
    confirmPassword: string;
    name?: string;
    surname?: string;
    gender?: "male" | "female";
}>>;
export type SignUp = z.infer<typeof signupSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type LogIn = z.infer<typeof loginSchema>;
