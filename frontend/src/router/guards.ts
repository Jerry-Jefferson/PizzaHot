import type { RouteLocationNormalized, RouteLocationRaw, Router } from "vue-router";

import { setUnauthorizedHandler } from "@/api";
import { queryClient } from "@/plugins/vue-query";
import { useAuthStore } from "@/stores/auth";
import { Role, type User } from "@/types/user.types";

export function homeRouteFor(user: User): RouteLocationRaw {
  return { name: user.role === Role.ADMIN ? "admin-dashboard" : "menu" };
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
  return getSafeRedirect(redirect) ?? homeRouteFor(user);
}

export function resolveAuthRedirect(
  to: RouteLocationNormalized,
  user: User | null
): RouteLocationRaw | true {
  if (!user) {
    return to.meta.requiresAuth ? { name: "sign-in", query: { redirect: to.fullPath } } : true;
  }
  if (to.meta.guestOnly) {
    return homeRouteFor(user);
  }
  if (to.meta.role === Role.ADMIN && user.role !== Role.ADMIN) {
    return { name: "menu" };
  }
  return true;
}

export function authGuard(to: RouteLocationNormalized): RouteLocationRaw | true {
  return resolveAuthRedirect(to, useAuthStore().user);
}

export async function handleSessionExpired(router: Router): Promise<void> {
  useAuthStore().reset();
  queryClient.clear();
  const current = router.currentRoute.value;
  if (current.meta.guestOnly) {
    return;
  }
  await router.push({ name: "sign-in", query: { redirect: current.fullPath } });
}

export function installAuthGuards(router: Router): void {
  router.beforeEach(authGuard);
  setUnauthorizedHandler(() => {
    void handleSessionExpired(router);
  });
}
