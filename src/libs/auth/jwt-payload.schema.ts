import { z } from "zod";
import { Role } from "./auth.constant.ts";

export const jwtPayloadSchema = z.object({
  sub: z.uuid({ error: "Token subject must be a UUID" }),
  email: z.email({ error: "Token email must be a valid address" }),
  role: z.enum(Role, { error: `Token role must be one of: ${Object.values(Role).join(", ")}` }),
  isEmailVerified: z.boolean({ error: "Token must state whether the email is verified" }),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
