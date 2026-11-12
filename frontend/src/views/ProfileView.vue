<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";

import AccountSummaryCard from "@/components/profile/AccountSummaryCard.vue";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm.vue";
import DangerZoneCard from "@/components/profile/DangerZoneCard.vue";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm.vue";
import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard.vue";
import { useChangePasswordForm } from "@/composables/useChangePasswordForm";
import { useConfirmDanger } from "@/composables/useConfirmDanger";
import { useMyOrders } from "@/composables/useMyOrders";
import { usePersonalInfoForm } from "@/composables/usePersonalInfoForm";
import {
  useChangePassword,
  useDeleteAccount,
  useUpdateMe,
} from "@/composables/useProfileMutations";
import { useAuthStore } from "@/stores/auth";

const { user } = storeToRefs(useAuthStore());

const personalInfo = usePersonalInfoForm(user);
const updateMe = useUpdateMe();

const passwordForm = useChangePasswordForm();
const changePassword = useChangePassword();

const deleteAccount = useDeleteAccount();
const confirmDanger = useConfirmDanger();

const { data: myOrders } = useMyOrders({ limit: 1 });
const totalOrders = computed(() => myOrders.value?.total ?? null);

async function savePersonalInfo(): Promise<void> {
  if (updateMe.isPending.value || !(await personalInfo.validate())) {
    return;
  }
  try {
    await updateMe.mutateAsync(personalInfo.toPayload());
  } catch (error) {
    personalInfo.applyServerError(error);
  }
}

async function updatePassword(): Promise<void> {
  if (changePassword.isPending.value || !(await passwordForm.validate())) {
    return;
  }
  try {
    await changePassword.mutateAsync(passwordForm.toPayload());
    passwordForm.reset();
  } catch (error) {
    passwordForm.applyServerError(error);
  }
}

function confirmDeleteAccount(): void {
  confirmDanger({
    title: "Delete account?",
    message:
      "This will permanently delete your account and sign you out. This action cannot be undone.",
    confirmLabel: "Delete account",
    onConfirm: () => deleteAccount.mutateAsync(),
  });
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-2xl flex-col gap-6">
    <h1 class="text-page-title">My Profile</h1>

    <template v-if="user">
      <ProfileHeaderCard :user="user" />

      <PersonalInfoForm
        v-model:name="personalInfo.form.name"
        v-model:surname="personalInfo.form.surname"
        v-model:gender="personalInfo.form.gender"
        :email="user.email"
        :errors="personalInfo.errors.value"
        :form-error="personalInfo.formError.value"
        :loading="updateMe.isPending.value"
        @blur="personalInfo.touch"
        @submit="savePersonalInfo"
      />

      <AccountSummaryCard :total-orders="totalOrders" :member-since="user.createdAt" />

      <ChangePasswordForm
        v-model:current-password="passwordForm.form.currentPassword"
        v-model:new-password="passwordForm.form.newPassword"
        v-model:confirm-password="passwordForm.form.confirmPassword"
        :errors="passwordForm.errors.value"
        :form-error="passwordForm.formError.value"
        :loading="changePassword.isPending.value"
        @blur="passwordForm.touch"
        @submit="updatePassword"
      />

      <DangerZoneCard @delete="confirmDeleteAccount" />
    </template>
  </section>
</template>
