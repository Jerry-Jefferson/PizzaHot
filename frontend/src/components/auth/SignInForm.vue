<script setup lang="ts">
import BaseButton from "@/components/base/BaseButton.vue";
import BaseFormAlert from "@/components/base/BaseFormAlert.vue";
import BaseFormField from "@/components/base/BaseFormField.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BasePasswordInput from "@/components/base/BasePasswordInput.vue";
import type { SignInErrors, SignInField } from "@/types/auth.types";

interface SignInFormProps {
  errors?: SignInErrors;
  formError?: string | null;
  loading?: boolean;
}

interface SignInFormEmits {
  submit: [];
  blur: [field: SignInField];
}

const { errors = {}, formError = null, loading } = defineProps<SignInFormProps>();
const emit = defineEmits<SignInFormEmits>();

const email = defineModel<string>("email", { required: true });
const password = defineModel<string>("password", { required: true });
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="emit('submit')">
    <BaseFormAlert v-if="formError" :message="formError" />

    <BaseFormField
      v-slot="{ id, invalid, describedBy }"
      input-id="sign-in-email"
      label="Email"
      :error="errors.email"
    >
      <BaseInput
        :id="id"
        v-model="email"
        type="email"
        icon="pi pi-envelope"
        placeholder="you@example.com"
        autocomplete="email"
        :invalid="invalid"
        :aria-describedby="describedBy"
        @blur="emit('blur', 'email')"
      />
    </BaseFormField>

    <BaseFormField
      v-slot="{ id, invalid, describedBy }"
      input-id="sign-in-password"
      label="Password"
      :error="errors.password"
    >
      <BasePasswordInput
        :id="id"
        v-model="password"
        placeholder="Enter your password"
        :invalid="invalid"
        :aria-describedby="describedBy"
        @blur="emit('blur', 'password')"
      />
    </BaseFormField>

    <BaseButton type="submit" label="Sign in" size="lg" block :loading="loading" />
  </form>
</template>
