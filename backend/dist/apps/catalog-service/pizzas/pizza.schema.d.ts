import { z } from "zod";
export declare const pizzaSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodCoercedNumber<unknown>;
    ingredientIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
}, z.core.$strip>;
export declare const updatePizzaSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodCoercedNumber<unknown>;
    ingredientIds: z.ZodDefault<z.ZodArray<z.ZodUUID>>;
}, z.core.$strip>;
export declare const listPizzasQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
