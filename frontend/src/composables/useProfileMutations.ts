import { useMutation, type UseMutationReturnType, useQueryClient } from "@tanstack/vue-query";
import { useRouter } from "vue-router";

import { changePassword, deleteMe, updateMe } from "@/api/users";
import { useAuthStore } from "@/stores/auth";
import type { ChangePasswordPayload, UpdateMePayload, User } from "@/types/user.types";

import { useAppToast } from "./useAppToast";

export function useUpdateMe(): UseMutationReturnType<User, Error, UpdateMePayload, unknown> {
  const auth = useAuthStore();
  const { showSuccess } = useAppToast();

  return useMutation({
    mutationFn: (payload) => updateMe(payload),
    onSuccess: (user) => {
      auth.setUser(user);
      showSuccess("Profile updated");
    },
  });
}

export function useChangePassword(): UseMutationReturnType<
  void,
  Error,
  ChangePasswordPayload,
  unknown
> {
  const { showSuccess } = useAppToast();

  return useMutation({
    mutationFn: (payload) => changePassword(payload),
    onSuccess: () => {
      showSuccess("Password updated");
    },
  });
}

export function useDeleteAccount(): UseMutationReturnType<void, Error, void, unknown> {
  const auth = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showSuccess } = useAppToast();

  return useMutation({
    mutationFn: () => deleteMe(),
    onSuccess: async () => {
      auth.reset();
      await router.push({ name: "sign-in" });
      queryClient.clear();
      showSuccess("Account deleted", "We're sorry to see you go");
    },
  });
}
