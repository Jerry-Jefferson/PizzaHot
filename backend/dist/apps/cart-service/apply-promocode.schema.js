import { z } from "zod";
export const applyPromocodeSchema = z.object({
    code: z
        .string({ error: "Code must be a string" })
        .trim()
        .min(1, { message: "Code cannot be empty" }),
});
//# sourceMappingURL=apply-promocode.schema.js.map