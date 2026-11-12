<script setup lang="ts">
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import BaseFormAlert from "@/components/base/BaseFormAlert.vue";
import BaseFormField from "@/components/base/BaseFormField.vue";
import BasePasswordInput from "@/components/base/BasePasswordInput.vue";
import type { ChangePasswordErrors, ChangePasswordField } from "@/types/user.types";

interface ChangePasswordFormProps {
  errors?: ChangePasswordErrors;
  formError?: string | null;
  loading?: boolean;
}

interface ChangePasswordFormEmits {
  submit: [];
  blur: [field: ChangePasswordField];
}

const { errors = {}, formError = null, loading } = defineProps<ChangePasswordFormProps>();
const emit = defineEmits<ChangePasswordFormEmits>();

const currentPassword = defineModel<string>("currentPassword", { required: true });
const newPassword = defineModel<string>("newPassword", { required: true });
const confirmPassword = defineModel<string>("confirmPassword", { required: true });
</script>

<template>
  <BaseCard>
    <template #header>
      <h2 class="flex items-center gap-2 text-section-title">
        <i class="pi pi-lock text-muted-foreground" aria-hidden="true" />
        Change password
      </h2>
    </template>

    <form class="flex flex-col gap-5" novalidate @submit.prevent="emit('submit')">
      <BaseFormAlert v-if="formError" :message="formError" />

      <BaseFormField
        v-slot="{ id, invalid, describedBy }"
        input-id="current-password"
        label="Current password"
        :error="errors.currentPassword"
      >
        <BasePasswordInput
          :id="id"
          v-model="currentPassword"
          autocomplete="current-password"
          :invalid="invalid"
          :aria-describedby="describedBy"
          @blur="emit('blur', 'currentPassword')"
        />
      </BaseFormField>

      <BaseFormField
        v-slot="{ id, invalid, describedBy }"
        input-id="new-password"
        label="New password"
        :error="errors.newPassword"
      >
        <BasePasswordInput
          :id="id"
          v-model="newPassword"
          autocomplete="new-password"
          :invalid="invalid"
          :aria-describedby="describedBy"
          @blur="emit('blur', 'newPassword')"
        />
      </BaseFormField>

      <BaseFormField
        v-slot="{ id, invalid, describedBy }"
        input-id="confirm-new-password"
        label="Confirm new password"
        :error="errors.confirmPassword"
      >
        <BasePasswordInput
          :id="id"
          v-model="confirmPassword"
          autocomplete="new-password"
          :invalid="invalid"
          :aria-describedby="describedBy"
          @blur="emit('blur', 'confirmPassword')"
        />
      </BaseFormField>

      <div class="flex justify-end">
        <BaseButton type="submit" variant="secondary" label="Update password" :loading="loading" />
      </div>
    </form>
  </BaseCard>
</template>
