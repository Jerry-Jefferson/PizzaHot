import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce
    .number({ error: "Page must be a number" })
    .int({ message: "Page must be an integer" })
    .min(1, { message: "Page must be at least 1" })
    .default(1),

  limit: z.coerce
    .number({ error: "Limit must be a number" })
    .int({ message: "Limit must be an integer" })
    .min(1, { message: "Limit must be at least 1" })
    .max(100, { message: "Limit must be at most 100" })
    .default(10),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
