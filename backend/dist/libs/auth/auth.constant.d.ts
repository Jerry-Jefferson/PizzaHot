export declare const IS_PUBLIC_KEY = "isPublic";
export declare const COOKIE_NAME = "access_token";
export declare const COOKIE_MAX_AGE_MS: number;
export declare const Role: {
    readonly USER: "user";
    readonly ADMIN: "admin";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const ROLES: readonly ["user", "admin"];
