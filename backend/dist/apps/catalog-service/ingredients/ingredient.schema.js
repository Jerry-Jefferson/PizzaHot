import { z } from "zod";
export const ingredientSchema = z.object({
    name: z.string({ error: "Name must be a string" }).min(1, { message: "Name cannot be empty" }),
});
export const updateIngredientSchema = z.object({
    name: z.string({ error: "Name must be a string" }).min(1, { message: "Name cannot be empty" }),
});
//# sourceMappingURL=ingredient.schema.js.map