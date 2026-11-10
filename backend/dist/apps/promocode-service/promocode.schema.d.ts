import { z } from "zod";
export declare const createPromocodeSchema: z.ZodObject<{
    code: z.ZodString;
    discount: z.ZodNumber;
    validTill: z.ZodCoercedDate<unknown>;
    discountMode: z.ZodEnum<{
        percentage: "percentage";
        fixed_amount: "fixed_amount";
    }>;
}, z.core.$strip>;
export declare const updatePromocodeSchema: z.ZodObject<{
    code: z.ZodString;
    discount: z.ZodNumber;
    validTill: z.ZodCoercedDate<unknown>;
    discountMode: z.ZodEnum<{
        percentage: "percentage";
        fixed_amount: "fixed_amount";
    }>;
}, z.core.$strip>;
