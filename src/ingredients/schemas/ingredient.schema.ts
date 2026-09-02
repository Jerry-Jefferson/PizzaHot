import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string({ error: "Name must be a string" }).min(1, { message: "Name cannot be empty" }),
  price: z.number({ error: "Price must be a number" }).positive({ message: "Price must be positive" }),
});

export const updateIngredientSchema = z
  .object({
    name: z.string({ error: "Name must be a string" }).min(1, { message: "Name cannot be empty" }).optional(),
    price: z.number({ error: "Price must be a number" }).positive({ message: "Price must be positive" }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
