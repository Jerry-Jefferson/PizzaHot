<script setup lang="ts">
import { storeToRefs } from "pinia";

import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";
import AdminProfileHeader from "@/components/admin/AdminProfileHeader.vue";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm.vue";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm.vue";
import { useChangePasswordForm } from "@/composables/useChangePasswordForm";
import { usePersonalInfoForm } from "@/composables/usePersonalInfoForm";
import { useChangePassword, useUpdateMe } from "@/composables/useProfileMutations";
import { useAuthStore } from "@/stores/auth";
import { ADMIN_EMAIL_HINT } from "@/utils/constants/user.constants";

const { user } = storeToRefs(useAuthStore());

const personalInfo = usePersonalInfoForm(user);
const updateMe = useUpdateMe();

const passwordForm = useChangePasswordForm();
const changePassword = useChangePassword();

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
</script>

<template>
  <section class="flex max-w-3xl flex-col gap-6">
    <AdminPageHeader title="Profile" subtitle="Manage your account details" />

    <template v-if="user">
      <AdminProfileHeader :user="user" />

      <PersonalInfoForm
        v-model:name="personalInfo.form.name"
        v-model:surname="personalInfo.form.surname"
        v-model:gender="personalInfo.form.gender"
        :email="user.email"
        :email-hint="ADMIN_EMAIL_HINT"
        :errors="personalInfo.errors.value"
        :form-error="personalInfo.formError.value"
        :loading="updateMe.isPending.value"
        @blur="personalInfo.touch"
        @submit="savePersonalInfo"
      />

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
    </template>
  </section>
</template>
