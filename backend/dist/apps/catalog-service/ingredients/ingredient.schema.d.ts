import { z } from "zod";
export declare const ingredientSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const updateIngredientSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
