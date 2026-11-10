import { z } from "zod";
import { paginationSchema } from "../../../libs/pagination/pagination.schema.js";
import { LogLevel } from "../../../libs/logging/log-level.constant.js";
export const listLogsQuerySchema = paginationSchema.extend({
    level: z
        .preprocess((val) => (typeof val === "string" ? val.toLowerCase() : val), z.enum(LogLevel, {
        error: `Level must be one of: ${Object.values(LogLevel).join(", ")}`,
    }))
        .optional(),
    context: z.string().optional(),
});
//# sourceMappingURL=log-query.schema.js.map