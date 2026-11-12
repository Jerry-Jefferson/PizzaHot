<script setup lang="ts">
import { computed } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";

interface PromoCodeFieldProps {
  appliedCode?: string | null;
  error?: string | null;
  loading?: boolean;
}

interface PromoCodeFieldEmits {
  apply: [];
  change: [];
}

const { appliedCode = null, error = null, loading } = defineProps<PromoCodeFieldProps>();
const emit = defineEmits<PromoCodeFieldEmits>();

const code = defineModel<string>({ default: "" });

const INPUT_ID = "promo-code";

const canApply = computed(() => code.value.trim().length > 0 && !loading);

function apply(): void {
  if (canApply.value) {
    emit("apply");
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="INPUT_ID" class="flex items-center gap-2 text-label">
      <i class="pi pi-tag text-muted-foreground" aria-hidden="true" />
      Promo code
    </label>
    <div v-if="appliedCode" class="flex gap-2">
      <BaseInput
        :id="INPUT_ID"
        :model-value="appliedCode"
        class="font-mono uppercase"
        disabled
      />
      <BaseButton variant="secondary" label="Change" :loading="loading" @click="emit('change')" />
    </div>
    <form v-else class="flex gap-2" novalidate @submit.prevent="apply">
      <BaseInput
        :id="INPUT_ID"
        v-model="code"
        placeholder="Enter code"
        autocomplete="off"
        :invalid="!!error"
        :aria-describedby="error ? `${INPUT_ID}-message` : undefined"
        :class="['font-mono uppercase placeholder:normal-case', { 'bg-primary/5': error }]"
      />
      <BaseButton
        type="submit"
        variant="secondary"
        label="Apply"
        :loading="loading"
        :disabled="!canApply"
      />
    </form>
    <p
      v-if="error && !appliedCode"
      :id="`${INPUT_ID}-message`"
      class="flex items-center gap-1 text-xs text-primary"
      role="alert"
    >
      <i class="pi pi-exclamation-circle text-xs" aria-hidden="true" />
      {{ error }}
    </p>
  </div>
</template>
