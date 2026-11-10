import { Permission } from "../permission.constant.ts";
export declare const PERMISSIONS_KEY = "permissions";
export declare const Can: (...permissions: Permission[]) => import("@nestjs/common").CustomDecorator<string>;
