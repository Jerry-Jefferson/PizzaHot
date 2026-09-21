import { z } from "zod";
import { paginationSchema } from "../../../libs/pagination/pagination.schema.ts";

export const pizzaSchema = z.object({
  name: z.string({ error: "Name must be a string" }).min(1, { message: "Name cannot be empty" }),
  description: z
    .string({ error: "Description must be a string" })
    .min(1, { message: "Description cannot be empty" }),
  price: z.coerce
    .number({ error: "Price must be a number" })
    .positive({ message: "Price must be positive" }),
  ingredientIds: z
    .array(z.uuid())
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate ingredient IDs are not allowed",
    })
    .optional(),
});

export const updatePizzaSchema = z
  .object({
    name: z
      .string({ error: "Name must be a string" })
      .min(1, { message: "Name cannot be empty" })
      .optional(),
    description: z
      .string({ error: "Description must be a string" })
      .min(1, { message: "Description cannot be empty" })
      .optional(),
    price: z.coerce
      .number({ error: "Price must be a number" })
      .positive({ message: "Price must be positive" })
      .optional(),
    ingredientIds: z
      .array(z.uuid())
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "Duplicate ingredient IDs are not allowed",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const listPizzasQuerySchema = paginationSchema.extend({
  search: z.string({ error: "Search must be a string" }).optional(),
});
