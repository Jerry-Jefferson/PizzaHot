import { z } from "zod";
import { DiscountType } from "../constants/discount-type.constant.ts";

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
    discountType: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED_AMOUNT], {
      error: "discountType must be either 'percentage' or 'fixed_amount'",
    }),
  })
  .refine(
    (data) => {
      if (data.discountType === DiscountType.PERCENTAGE && data.discount > 100) {
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
      .max(50, { message: "Code cannot exceed 50 characters" })
      .optional(),
    discount: z
      .number({ error: "Discount must be a number" })
      .int({ message: "Discount must be an integer" })
      .positive({ message: "Discount must be positive" })
      .optional(),
    validTill: z.coerce.date({ error: "validTill must be a valid date" }).optional(),
    discountType: z
      .enum([DiscountType.PERCENTAGE, DiscountType.FIXED_AMOUNT], {
        error: "discountType must be either 'percentage' or 'fixed_amount'",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .refine(
    (data) => {
      if (
        data.discountType === DiscountType.PERCENTAGE &&
        data.discount !== undefined &&
        data.discount > 100
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100",
      path: ["discount"],
    }
  );
