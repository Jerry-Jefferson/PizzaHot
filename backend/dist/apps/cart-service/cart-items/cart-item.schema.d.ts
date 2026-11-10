import { z } from "zod";
export declare const addCartItemSchema: z.ZodObject<{
    pizzaId: z.ZodUUID;
    quantity: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const updateCartItemSchema: z.ZodObject<{
    quantity: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
