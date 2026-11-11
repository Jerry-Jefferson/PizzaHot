<script setup lang="ts">
import { computed } from "vue";

interface BaseFormFieldProps {
  inputId: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

const { inputId, label, hint, error, required } = defineProps<BaseFormFieldProps>();

defineSlots<{
  default: (scope: { id: string; invalid: boolean; describedBy: string | undefined }) => unknown;
}>();

const messageId = computed(() => `${inputId}-message`);
const describedBy = computed(() => (error || hint ? messageId.value : undefined));
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="inputId" class="text-label text-foreground">
      {{ label }}<span v-if="required" class="text-primary" aria-hidden="true"> *</span>
    </label>
    <slot :id="inputId" :invalid="!!error" :described-by="describedBy" />
    <p
      v-if="error"
      :id="messageId"
      class="flex items-center gap-1 text-xs text-primary"
      role="alert"
    >
      <i class="pi pi-exclamation-circle text-xs" aria-hidden="true" />
      {{ error }}
    </p>
    <p v-else-if="hint" :id="messageId" class="text-caption">{{ hint }}</p>
  </div>
</template>
