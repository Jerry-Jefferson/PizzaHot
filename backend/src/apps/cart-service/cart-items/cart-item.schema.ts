import { MAX_PIZZA_QUANTITY } from "../../../libs/contracts/order-limit.constant.ts";
import { z } from "zod";

export const addCartItemSchema = z.object({
  pizzaId: z.uuid({ error: "pizzaId must be a valid UUID" }),
  quantity: z.coerce
    .number({ error: "Quantity must be a number" })
    .int({ message: "Quantity must be an integer" })
    .positive({ message: "Quantity must be positive" })
    .max(MAX_PIZZA_QUANTITY, { message: `Quantity cannot exceed ${MAX_PIZZA_QUANTITY}` })
    .default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number({ error: "Quantity must be a number" })
    .int({ message: "Quantity must be an integer" })
    .nonnegative()
    .max(MAX_PIZZA_QUANTITY, { message: `Quantity cannot exceed ${MAX_PIZZA_QUANTITY}` }),
});
