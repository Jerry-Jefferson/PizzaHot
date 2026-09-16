import { z } from "zod";

export const mostOrderedPizzaQuerySchema = z.object({
  month: z.coerce
    .number({ message: "month must be a number" })
    .int()
    .min(1, { message: "month must be between 1 and 12" })
    .max(12, { message: "month must be between 1 and 12" }),
  year: z.coerce
    .number({ message: "year must be a number" })
    .int()
    .min(2000, { message: "year must be 2000 or later" })
    .max(2100, { message: "year must be 2100 or earlier" }),
});
