import type { Request } from "express";
import type { JwtPayload } from "../auth/jwt-payload.schema.ts";

export interface LoggedRequest extends Request {
  user?: JwtPayload;
  errorLogged?: boolean;
}
