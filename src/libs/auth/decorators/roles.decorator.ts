import { SetMetadata } from "@nestjs/common";
import { Role } from "../../common/constants/role.enum.ts";

export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
