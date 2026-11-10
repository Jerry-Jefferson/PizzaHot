import { z } from "zod";
export declare const mostOrderedPizzaQuerySchema: z.ZodObject<{
    month: z.ZodCoercedNumber<unknown>;
    year: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
