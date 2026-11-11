<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

import SignInForm from "@/components/auth/SignInForm.vue";
import { useSignInForm } from "@/composables/useSignInForm";
import { getPostSignInRoute } from "@/router/guards";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { form, errors, formError, touch, validate, toPayload, applyServerError } = useSignInForm();

const isSubmitting = ref(false);

async function submit(): Promise<void> {
  if (isSubmitting.value || !(await validate())) {
    return;
  }
  isSubmitting.value = true;
  try {
    const user = await auth.signIn(toPayload());
    await router.replace(getPostSignInRoute(user, route.query.redirect));
  } catch (error) {
    applyServerError(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="flex flex-col gap-8">
    <header class="flex flex-col gap-2">
      <h1 class="text-page-title">Welcome back</h1>
      <p class="text-muted-foreground">Sign in to your account to continue.</p>
    </header>

    <SignInForm
      v-model:email="form.email"
      v-model:password="form.password"
      :errors="errors"
      :form-error="formError"
      :loading="isSubmitting"
      @blur="touch"
      @submit="submit"
    />

    <p class="text-center text-sm text-muted-foreground">
      Don't have an account?
      <RouterLink :to="{ name: 'sign-up' }" class="font-medium text-primary hover:underline">
        Create one
      </RouterLink>
    </p>
  </section>
</template>
