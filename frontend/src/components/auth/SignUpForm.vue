<script setup lang="ts">
import { useTemplateRef } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseFormField from "@/components/base/BaseFormField.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BasePasswordInput from "@/components/base/BasePasswordInput.vue";
import type { SignUpErrors, SignUpField, SignUpFormExpose } from "@/types/auth.types";

interface SignUpFormProps {
  errors?: SignUpErrors;
  formError?: string | null;
  loading?: boolean;
}

interface SignUpFormEmits {
  submit: [];
  blur: [field: SignUpField];
}

const { errors = {}, formError = null, loading } = defineProps<SignUpFormProps>();
const emit = defineEmits<SignUpFormEmits>();

const name = defineModel<string>("name", { required: true });
const surname = defineModel<string>("surname", { required: true });
const email = defineModel<string>("email", { required: true });
const password = defineModel<string>("password", { required: true });
const confirmPassword = defineModel<string>("confirmPassword", { required: true });

const FIELD_IDS: Record<SignUpField, string> = {
  name: "sign-up-name",
  surname: "sign-up-surname",
  email: "sign-up-email",
  password: "sign-up-password",
  confirmPassword: "sign-up-confirm-password",
};

const formElement = useTemplateRef<HTMLFormElement>("form");

function focusField(field: SignUpField): void {
  formElement.value?.querySelector<HTMLInputElement>(`#${FIELD_IDS[field]}`)?.focus();
}

defineExpose<SignUpFormExpose>({ focusField });
</script>

<template>
  <form ref="form" class="flex flex-col gap-5" novalidate @submit.prevent="emit('submit')">
    <div
      v-if="formError"
      class="flex items-center gap-2 rounded-control bg-primary/10 px-3 py-2.5 text-sm text-primary"
      role="alert"
      data-test="form-error"
    >
      <i class="pi pi-exclamation-circle" aria-hidden="true" />
      {{ formError }}
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <BaseFormField
        v-slot="{ id, invalid, describedBy }"
        :input-id="FIELD_IDS.name"
        label="First name"
        :error="errors.name"
      >
        <BaseInput
          :id="id"
          v-model="name"
          icon="pi pi-user"
          placeholder="Mario"
          autocomplete="given-name"
          :invalid="invalid"
          :aria-describedby="describedBy"
          @blur="emit('blur', 'name')"
        />
      </BaseFormField>

      <BaseFormField
        v-slot="{ id, invalid, describedBy }"
        :input-id="FIELD_IDS.surname"
        label="Last name"
        :error="errors.surname"
      >
        <BaseInput
          :id="id"
          v-model="surname"
          placeholder="Rossi"
          autocomplete="family-name"
          :invalid="invalid"
          :aria-describedby="describedBy"
          @blur="emit('blur', 'surname')"
        />
      </BaseFormField>
    </div>

    <BaseFormField
      v-slot="{ id, invalid, describedBy }"
      :input-id="FIELD_IDS.email"
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
      :input-id="FIELD_IDS.password"
      label="Password"
      :error="errors.password"
    >
      <BasePasswordInput
        :id="id"
        v-model="password"
        placeholder="Create a password"
        autocomplete="new-password"
        :invalid="invalid"
        :aria-describedby="describedBy"
        @blur="emit('blur', 'password')"
      />
    </BaseFormField>

    <BaseFormField
      v-slot="{ id, invalid, describedBy }"
      :input-id="FIELD_IDS.confirmPassword"
      label="Confirm password"
      :error="errors.confirmPassword"
    >
      <BasePasswordInput
        :id="id"
        v-model="confirmPassword"
        placeholder="Repeat your password"
        autocomplete="new-password"
        :invalid="invalid"
        :aria-describedby="describedBy"
        @blur="emit('blur', 'confirmPassword')"
      />
    </BaseFormField>

    <BaseButton type="submit" label="Create account" size="lg" block :loading="loading" />
  </form>
</template>
