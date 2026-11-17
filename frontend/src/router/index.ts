import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import { Role, type User } from "@/types/user.types";
import { getHomeRoute } from "@/utils/auth-redirect";
import { ROUTES } from "@/utils/constants/routes.constants";

import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

function resolveAuthRedirect(
  to: RouteLocationNormalized,
  user: User | null
): RouteLocationRaw | true {
  if (!user) {
    return to.meta.requiresAuth
      ? { name: ROUTES.SIGN_IN.NAME, query: { redirect: to.fullPath } }
      : true;
  }
  if (to.meta.guestOnly) {
    return getHomeRoute(user);
  }
  if (to.meta.role === Role.ADMIN && user.role !== Role.ADMIN) {
    return { name: ROUTES.HOME.NAME };
  }
  return true;
}

export async function authGuard(to: RouteLocationNormalized): Promise<RouteLocationRaw | true> {
  const auth = useAuthStore();
  await auth.ensureSession();
  return resolveAuthRedirect(to, auth.user);
}

router.beforeEach(authGuard);

export default router;
