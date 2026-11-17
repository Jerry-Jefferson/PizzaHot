import { useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import { ROUTES } from "@/utils/constants/routes.constants";

import { useAppToast } from "./useAppToast";

export function useSignOut(): { signOut: () => Promise<void> } {
  const auth = useAuthStore();
  const router = useRouter();
  const { showError } = useAppToast();

  async function signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      showError(error, "Sign-out failed");
    }
    await router.push({ name: ROUTES.SIGN_IN.NAME });
  }

  return { signOut };
}
