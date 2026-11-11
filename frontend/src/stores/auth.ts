import { isAxiosError } from "axios";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";

import * as authApi from "@/api/auth";
import { queryClient } from "@/plugins/vue-query";
import type { AuthStatus, SignInPayload, SignUpPayload } from "@/types/auth.types";
import { Role, type User } from "@/types/user.types";
import { getInitials } from "@/utils/initials";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const status = ref<AuthStatus>("idle");

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === Role.ADMIN);
  const isEmailVerified = computed(() => user.value?.isEmailVerified ?? false);
  const initials = computed(() => (user.value ? getInitials(user.value) : ""));
  const displayName = computed(() => {
    if (!user.value) {
      return "";
    }
    const fullName = [user.value.name, user.value.surname]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(" ");
    return fullName || user.value.email;
  });

  async function restoreSession(): Promise<void> {
    status.value = "loading";
    try {
      user.value = await authApi.me();
    } catch (error) {
      user.value = null;
      if (!isAxiosError(error) || error.response?.status !== 401) {
        throw error;
      }
    } finally {
      status.value = "ready";
    }
  }

  async function signIn(payload: SignInPayload): Promise<User> {
    const response = await authApi.signIn(payload);
    user.value = response.user;
    return response.user;
  }

  async function signUp(payload: SignUpPayload): Promise<User> {
    const response = await authApi.signUp(payload);
    user.value = response.user;
    return response.user;
  }

  async function signOut(): Promise<void> {
    try {
      await authApi.signOut();
    } finally {
      reset();
      queryClient.clear();
    }
  }

  function setUser(nextUser: User): void {
    user.value = nextUser;
  }

  function reset(): void {
    user.value = null;
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
