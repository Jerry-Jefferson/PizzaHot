import { Role } from "./auth.constant.js";
export const Permission = {
    PIZZA_READ: "pizza:read",
    PIZZA_WRITE: "pizza:write",
    PIZZA_DELETE: "pizza:delete",
    INGREDIENT_READ: "ingredient:read",
    INGREDIENT_WRITE: "ingredient:write",
    INGREDIENT_DELETE: "ingredient:delete",
    PROMOCODE_READ: "promocode:read",
    PROMOCODE_WRITE: "promocode:write",
    PROMOCODE_DELETE: "promocode:delete",
    CART_MANAGE: "cart:manage",
    ORDER_CREATE: "order:create",
    ORDER_READ_OWN: "order:read:own",
    ORDER_READ_ANY: "order:read:any",
    ORDER_STATUS_WRITE: "order:status:write",
    USER_MANAGE_OWN: "user:manage:own",
    USER_READ_ANY: "user:read:any",
    USER_ROLE_WRITE: "user:role:write",
    ANALYTICS_READ: "analytics:read",
    LOG_READ: "log:read",
};
const USER_PERMISSIONS = [
    Permission.PIZZA_READ,
    Permission.INGREDIENT_READ,
    Permission.CART_MANAGE,
    Permission.ORDER_CREATE,
    Permission.ORDER_READ_OWN,
    Permission.USER_MANAGE_OWN,
];
const ADMIN_ONLY_PERMISSIONS = [
    Permission.PIZZA_WRITE,
    Permission.PIZZA_DELETE,
    Permission.INGREDIENT_WRITE,
    Permission.INGREDIENT_DELETE,
    Permission.PROMOCODE_READ,
    Permission.PROMOCODE_WRITE,
    Permission.PROMOCODE_DELETE,
    Permission.ORDER_READ_ANY,
    Permission.ORDER_STATUS_WRITE,
    Permission.USER_READ_ANY,
    Permission.USER_ROLE_WRITE,
    Permission.ANALYTICS_READ,
    Permission.LOG_READ,
];
export const ROLE_PERMISSIONS = {
    [Role.USER]: USER_PERMISSIONS,
    [Role.ADMIN]: [...USER_PERMISSIONS, ...ADMIN_ONLY_PERMISSIONS],
};
//# sourceMappingURL=permission.constant.js.map