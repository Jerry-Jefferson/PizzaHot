import { isAxiosError } from "axios";

import { queryClient } from "@/plugins/vue-query";
import router from "@/router";
import { toApiError } from "@/services/errors";
import { useAuthStore } from "@/stores/auth";
import { ROUTES } from "@/utils/constants/routes.constants";
import { logError } from "@/utils/logger";

const PATHS_WITHOUT_UNAUTHORIZED_HANDLER = new Set([
  "/auth/me",
  "/auth/login",
  "/users/me/password",
]);

export async function handleSessionExpired(): Promise<void> {
  useAuthStore().reset();
  queryClient.clear();
  const current = router.currentRoute.value;
  if (current.meta.guestOnly) {
    return;
  }
  await router.push({ name: ROUTES.SIGN_IN.NAME, query: { redirect: current.fullPath } });
}

export function handleUnauthorized(error: unknown): Promise<never> {
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    !PATHS_WITHOUT_UNAUTHORIZED_HANDLER.has(error.config?.url ?? "")
  ) {
    handleSessionExpired().catch(logError("Session expiry redirect"));
  }
  return Promise.reject(error instanceof Error ? error : new Error(String(error)));
}

export function normalizeError(error: unknown): Promise<never> {
  const normalized = toApiError(error);
  return Promise.reject(normalized instanceof Error ? normalized : new Error(String(normalized)));
}
