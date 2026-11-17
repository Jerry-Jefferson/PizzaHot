import type { RouteLocationRaw } from "vue-router";

import { Role, type User } from "@/types/user.types";
import { ROUTES } from "@/utils/constants/routes.constants";

export function getHomeRoute(user: User): RouteLocationRaw {
  return { name: user.role === Role.ADMIN ? ROUTES.ADMIN.NAME : ROUTES.HOME.NAME };
}

export function getSafeRedirect(redirect: unknown): string | null {
  const isInternalPath =
    typeof redirect === "string" &&
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.startsWith("/\\");
  return isInternalPath ? redirect : null;
}

export function getPostSignInRoute(user: User, redirect: unknown): RouteLocationRaw {
  return getSafeRedirect(redirect) ?? getHomeRoute(user);
}
