<script setup lang="ts">
import { ref } from "vue";

import BaseInput from "./BaseInput.vue";

interface BasePasswordInputProps {
  id?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  autocomplete?: "current-password" | "new-password";
}

defineOptions({ inheritAttrs: false });

const {
  id,
  placeholder,
  invalid,
  disabled,
  autocomplete = "current-password",
} = defineProps<BasePasswordInputProps>();

const model = defineModel<string>({ default: "" });

const isVisible = ref(false);
</script>

<template>
  <BaseInput
    v-bind="$attrs"
    :id="id"
    v-model="model"
    icon="pi pi-lock"
    :type="isVisible ? 'text' : 'password'"
    :placeholder="placeholder"
    :invalid="invalid"
    :disabled="disabled"
    :autocomplete="autocomplete"
  >
    <template #trailing>
      <button
        type="button"
        class="cursor-pointer text-muted-foreground hover:text-foreground"
        :aria-label="isVisible ? 'Hide password' : 'Show password'"
        :aria-pressed="isVisible"
        :disabled="disabled"
        @click="isVisible = !isVisible"
      >
        <i :class="isVisible ? 'pi pi-eye-slash' : 'pi pi-eye'" aria-hidden="true" />
      </button>
    </template>
  </BaseInput>
</template>
