import { SetMetadata } from "@nestjs/common";
import { Permission } from "../permission.constant.ts";

export const PERMISSIONS_KEY = "permissions";

export const Can = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
