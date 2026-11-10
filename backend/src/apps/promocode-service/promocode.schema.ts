import { z } from "zod";
import { DiscountMode } from "../../libs/contracts/index.ts";

export const createPromocodeSchema = z
  .object({
    code: z
      .string({ error: "Code must be a string" })
      .trim()
      .min(1, { message: "Code cannot be empty" })
      .max(50, { message: "Code cannot exceed 50 characters" }),
    discount: z
      .number({ error: "Discount must be a number" })
      .int({ message: "Discount must be an integer" })
      .positive({ message: "Discount must be positive" }),
    validTill: z.coerce
      .date({ error: "validTill must be a valid date" })
      .refine((date) => date.getTime() > Date.now(), {
        message: "validTill must be in the future",
      }),
    discountMode: z.enum([DiscountMode.PERCENTAGE, DiscountMode.FIXED_AMOUNT], {
      error: "discountMode must be either 'percentage' or 'fixed_amount'",
    }),
  })
  .refine(
    (data) => {
      if (data.discountMode === DiscountMode.PERCENTAGE && data.discount > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100",
      path: ["discount"],
    }
  );

export const updatePromocodeSchema = z
  .object({
    code: z
      .string({ error: "Code must be a string" })
      .trim()
      .min(1, { message: "Code cannot be empty" })
      .max(50, { message: "Code cannot exceed 50 characters" }),
    discount: z
      .number({ error: "Discount must be a number" })
      .int({ message: "Discount must be an integer" })
      .positive({ message: "Discount must be positive" }),
    validTill: z.coerce.date({ error: "validTill must be a valid date" }),
    discountMode: z.enum([DiscountMode.PERCENTAGE, DiscountMode.FIXED_AMOUNT], {
      error: "discountMode must be either 'percentage' or 'fixed_amount'",
    }),
  })
  .refine((data) => !(data.discountMode === DiscountMode.PERCENTAGE && data.discount > 100), {
    message: "Percentage discount cannot exceed 100",
    path: ["discount"],
  });
