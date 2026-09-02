import { z } from "zod";
import { paginationSchema } from "../../shared/pagination/pagination.schema.ts";

export const pizzaSchema = z.object({
  name: z.string({ error: "Name must be a string" }).min(1, { message: "Name cannot be empty" }),
  description: z
    .string({ error: "Description must be a string" })
    .min(1, { message: "Description cannot be empty" }),
  image: z.string({ error: "Image must be a string" }).optional().nullable(),
  price: z
    .number({ error: "Price must be a number" })
    .positive({ message: "Price must be positive" }),
});

export type Pizza = z.infer<typeof pizzaSchema>;

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
    image: z.string({ error: "Image must be a string" }).optional().nullable(),
    price: z
      .number({ error: "Price must be a number" })
      .positive({ message: "Price must be positive" })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const listPizzasQuerySchema = paginationSchema.extend({
  search: z.string({ error: "Search must be a string" }).optional(),
});
