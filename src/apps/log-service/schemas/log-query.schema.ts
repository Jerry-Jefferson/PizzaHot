import { z } from "zod";
import { paginationSchema } from "../../../libs/common/pagination/pagination.schema.ts";
import { LogLevel } from "../../../libs/logging/log-level.constant.ts";

export const listLogsQuerySchema = paginationSchema.extend({
  level: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase() : val),
      z.enum(LogLevel, {
        error: `Level must be one of: ${Object.values(LogLevel).join(", ")}`,
      })
    )
    .optional(),
  context: z.string().optional(),
});

export type ListLogsQuery = z.infer<typeof listLogsQuerySchema>;
