import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string({ error: "Name must be a string" }).min(1, { message: "Name cannot be empty" }),
});

export const updateIngredientSchema = z
  .object({
    name: z
      .string({ error: "Name must be a string" })
      .min(1, { message: "Name cannot be empty" })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
