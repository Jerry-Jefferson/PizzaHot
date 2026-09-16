import { Role } from "../common/constants/role.enum.ts";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}
