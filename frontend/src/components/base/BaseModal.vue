<script setup lang="ts">
import Dialog from "primevue/dialog";

interface BaseModalProps {
  header: string;
  widthClass?: string;
  persistent?: boolean;
}

const { header, widthClass = "max-w-lg", persistent } = defineProps<BaseModalProps>();

const visible = defineModel<boolean>("visible", { required: true });

defineSlots<{ default?: () => unknown; footer?: () => unknown }>();
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="header"
    modal
    :closable="!persistent"
    :dismissable-mask="!persistent"
    :draggable="false"
    :class="['w-[calc(100vw-2rem)]', widthClass]"
    :pt="{
      mask: { class: 'bg-foreground/40 backdrop-blur-sm' },
      root: { class: 'rounded-card border border-border bg-card text-card-foreground shadow-card' },
      title: { class: 'font-display text-xl font-semibold' },
    }"
  >
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>
