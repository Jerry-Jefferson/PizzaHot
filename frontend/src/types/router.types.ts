import "vue-router";

import type { Role } from "./user.types";

export type AppLayout = "auth" | "customer" | "admin";

declare module "vue-router" {
  interface RouteMeta {
    layout: AppLayout;
    requiresAuth?: boolean;
    guestOnly?: boolean;
    role?: Extract<Role, "admin">;
    title?: string;
  }
}
