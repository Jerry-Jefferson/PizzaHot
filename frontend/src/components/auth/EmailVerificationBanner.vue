<script setup lang="ts">
interface EmailVerificationBannerProps {
  loading?: boolean;
}

interface EmailVerificationBannerEmits {
  refresh: [];
}

const { loading } = defineProps<EmailVerificationBannerProps>();
const emit = defineEmits<EmailVerificationBannerEmits>();
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-x-2 gap-y-1 bg-status-warning-bg px-4 py-2.5 text-sm text-status-warning-fg"
    role="status"
    data-test="email-verification-banner"
  >
    <i class="pi pi-envelope" aria-hidden="true" />
    <span>Verify your email to place orders. Already verified?</span>
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-1 font-semibold underline underline-offset-2 disabled:cursor-wait disabled:opacity-70"
      :disabled="loading"
      @click="emit('refresh')"
    >
      <i v-if="loading" class="pi pi-spin pi-spinner text-xs" aria-hidden="true" />
      Refresh
    </button>
  </div>
</template>
