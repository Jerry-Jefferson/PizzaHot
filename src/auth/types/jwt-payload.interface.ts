import { Role } from "../../shared/constants/role.enum.ts";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}
