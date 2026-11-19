import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";

import { queryClient } from "@/plugins/vue-query";
import * as authApi from "@/services/api/auth";
import type { AuthStatus, SignInPayload, SignUpPayload } from "@/types/auth.types";
import { Role, type User } from "@/types/user.types";
import { getErrorStatus } from "@/utils/errors";
import { getInitials } from "@/utils/initials";
import { logError } from "@/utils/logger";
import { getUserDisplayName } from "@/utils/user";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const status = ref<AuthStatus>("idle");

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === Role.ADMIN);
  const isEmailVerified = computed(() => user.value?.isEmailVerified ?? false);
  const initials = computed(() => (user.value ? getInitials(user.value) : ""));
  const displayName = computed(() => (user.value ? getUserDisplayName(user.value) : ""));

  function setAuthenticatedUser(nextUser: User | null): void {
    const previousId = user.value?.id;
    user.value = nextUser;
    if (previousId !== undefined && previousId !== nextUser?.id) {
      queryClient.clear();
    }
  }

  async function restoreSession(): Promise<void> {
    status.value = "loading";
    try {
      setAuthenticatedUser(await authApi.me());
    } catch (error) {
      if (getErrorStatus(error) !== 401) {
        throw error;
      }
      setAuthenticatedUser(null);
    } finally {
      status.value = "ready";
    }
  }

  let initialSession: Promise<void> | null = null;

  function ensureSession(): Promise<void> {
    initialSession ??= restoreSession().catch(logError("Session restore"));
    return initialSession;
  }

  async function signIn(payload: SignInPayload): Promise<User> {
    const response = await authApi.signIn(payload);
    setAuthenticatedUser(response.user);
    return response.user;
  }

  async function signUp(payload: SignUpPayload): Promise<User> {
    const response = await authApi.signUp(payload);
    setAuthenticatedUser(response.user);
    return response.user;
  }

  async function signOut(): Promise<void> {
    try {
      await authApi.signOut();
    } finally {
      reset();
    }
  }

  function setUser(nextUser: User): void {
    setAuthenticatedUser(nextUser);
  }

  function reset(): void {
    setAuthenticatedUser(null);
  }

  return {
    user,
    status,
    isAuthenticated,
    isAdmin,
    isEmailVerified,
    initials,
    displayName,
    restoreSession,
    ensureSession,
    signIn,
    signUp,
    signOut,
    setUser,
    reset,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
