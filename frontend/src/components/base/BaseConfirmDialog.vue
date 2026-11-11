<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import { ref } from "vue";

import { useAppToast } from "@/composables/useAppToast";
import { CONFIRM_DANGER_GROUP, type ConfirmDangerMessage } from "@/composables/useConfirmDanger";

import BaseButton from "./BaseButton.vue";

const { showError } = useAppToast();
const isConfirming = ref(false);

async function confirm(message: ConfirmDangerMessage, close: () => void): Promise<void> {
  isConfirming.value = true;
  try {
    await message.onConfirm();
    close();
  } catch (error) {
    showError(error);
  } finally {
    isConfirming.value = false;
  }
}

function cancel(close: () => void): void {
  if (!isConfirming.value) {
    close();
  }
}
</script>

<template>
  <ConfirmDialog
    :group="CONFIRM_DANGER_GROUP"
    :draggable="false"
    :pt="{
      mask: { class: 'bg-foreground/40 backdrop-blur-sm' },
      root: {
        class:
          'w-[calc(100vw-2rem)] max-w-sm rounded-card border border-border bg-card text-card-foreground shadow-card',
      },
    }"
  >
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col" role="alertdialog" aria-modal="true">
        <div class="flex gap-4 p-5">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <i class="pi pi-exclamation-circle" aria-hidden="true" />
          </span>
          <div class="flex flex-col gap-1">
            <h2 class="text-label font-bold text-foreground">{{ message.header }}</h2>
            <p class="text-sm text-muted-foreground">{{ message.message }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-border px-5 py-4">
          <BaseButton
            variant="secondary"
            size="sm"
            :label="message.rejectLabel"
            :disabled="isConfirming"
            @click="cancel(rejectCallback)"
          />
          <BaseButton
            size="sm"
            :label="message.acceptLabel"
            :loading="isConfirming"
            @click="confirm(message, acceptCallback)"
          />
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>
