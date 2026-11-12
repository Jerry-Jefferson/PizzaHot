<script setup lang="ts">
interface BaseFormAlertProps {
  message: string;
}

const { message } = defineProps<BaseFormAlertProps>();
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-control bg-primary/10 px-3 py-2.5 text-sm text-primary"
    role="alert"
    data-test="form-error"
  >
    <i class="pi pi-exclamation-circle" aria-hidden="true" />
    {{ message }}
  </div>
</template>
