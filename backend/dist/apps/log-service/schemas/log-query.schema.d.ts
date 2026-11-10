import { z } from "zod";
export declare const listLogsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    level: z.ZodOptional<z.ZodPreprocess<z.ZodEnum<{
        readonly INFO: "info";
        readonly ERROR: "error";
    }>>>;
    context: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ListLogsQuery = z.infer<typeof listLogsQuerySchema>;
