<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue";
import { RouterLink, useRouter } from "vue-router";

import SignUpForm from "@/components/auth/SignUpForm.vue";
import { useAppToast } from "@/composables/useAppToast";
import { useSignUpForm } from "@/composables/useSignUpForm";
import { useAuthStore } from "@/stores/auth";
import type { SignUpFormExpose } from "@/types/auth.types";

const auth = useAuthStore();
const router = useRouter();
const { showSuccess } = useAppToast();
const { form, errors, formError, firstInvalidField, touch, validate, toPayload, applyServerError } =
  useSignUpForm();

const signUpForm = useTemplateRef<SignUpFormExpose>("signUpForm");
const isSubmitting = ref(false);

async function focusFirstInvalidField(): Promise<void> {
  await nextTick();
  if (firstInvalidField.value) {
    signUpForm.value?.focusField(firstInvalidField.value);
  }
}

async function submit(): Promise<void> {
  if (isSubmitting.value) {
    return;
  }
  if (!(await validate())) {
    await focusFirstInvalidField();
    return;
  }
  isSubmitting.value = true;
  try {
    await auth.signUp(toPayload());
    showSuccess("Account created", "Check your inbox to verify your email");
    await router.push({ name: "menu" });
  } catch (error) {
    applyServerError(error);
    await focusFirstInvalidField();
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="flex flex-col gap-8">
    <header class="flex flex-col gap-2">
      <h1 class="text-page-title">Create account</h1>
      <p class="text-muted-foreground">Sign up to start ordering.</p>
    </header>

    <SignUpForm
      ref="signUpForm"
      v-model:name="form.name"
      v-model:surname="form.surname"
      v-model:email="form.email"
      v-model:password="form.password"
      v-model:confirm-password="form.confirmPassword"
      :errors="errors"
      :form-error="formError"
      :loading="isSubmitting"
      @blur="touch"
      @submit="submit"
    />

    <p class="text-center text-sm text-muted-foreground">
      Already have an account?
      <RouterLink :to="{ name: 'sign-in' }" class="font-medium text-primary hover:underline">
        Sign in
      </RouterLink>
    </p>
  </section>
</template>
