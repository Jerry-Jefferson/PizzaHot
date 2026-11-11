import { type Ref, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";

import { useAppToast } from "./useAppToast";

interface RefreshSession {
  isRefreshing: Ref<boolean>;
  refreshSession: () => Promise<void>;
}

export function useRefreshSession(): RefreshSession {
  const auth = useAuthStore();
  const route = useRoute();
  const router = useRouter();
  const { showSuccess, showError } = useAppToast();

  const isRefreshing = ref(false);

  async function refreshSession(): Promise<void> {
    if (isRefreshing.value) {
      return;
    }
    isRefreshing.value = true;
    try {
      await auth.restoreSession();
      if (!auth.user) {
        await router.push({ name: "sign-in", query: { redirect: route.fullPath } });
      } else if (auth.isEmailVerified) {
        showSuccess("Email verified", "You can now place orders");
      }
    } catch (error) {
      showError(error, "Could not refresh your account");
    } finally {
      isRefreshing.value = false;
    }
  }

  return { isRefreshing, refreshSession };
}
