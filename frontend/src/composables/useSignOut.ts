import { useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";

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
    await router.push({ name: "sign-in" });
  }

  return { signOut };
}
