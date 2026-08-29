import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int({ error: "Page must be an integer" })
    .min(1, { error: "Page must be at least 1" })
    .default(1),

  limit: z.coerce
    .number()
    .int({ error: "Limit must be an integer" })
    .min(1, { error: "Limit must be at least 1" })
    .max(100, { error: "Limit must be at most 100" })
    .default(10),
});
