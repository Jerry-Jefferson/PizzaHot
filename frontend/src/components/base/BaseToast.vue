<script setup lang="ts">
import Toast from "primevue/toast";

const SEVERITY_STYLES: Record<string, { classes: string; icon: string }> = {
  success: {
    classes: "bg-status-success-bg text-status-success-fg border-status-success-fg/20",
    icon: "pi pi-check-circle",
  },
  error: {
    classes: "bg-primary/10 text-primary border-primary/20",
    icon: "pi pi-exclamation-circle",
  },
  info: {
    classes: "bg-status-info-bg text-status-info-fg border-status-info-fg/20",
    icon: "pi pi-info-circle",
  },
  warn: {
    classes: "bg-status-warning-bg text-status-warning-fg border-status-warning-fg/20",
    icon: "pi pi-exclamation-triangle",
  },
};

const DEFAULT_STYLE = {
  classes: "bg-card text-foreground border-border",
  icon: "pi pi-info-circle",
};

function styleFor(severity: unknown): { classes: string; icon: string } {
  return (typeof severity === "string" ? SEVERITY_STYLES[severity] : undefined) ?? DEFAULT_STYLE;
}
</script>

<template>
  <Toast
    position="bottom-right"
    :pt="{ message: { class: 'border-0 bg-transparent shadow-none' } }"
  >
    <template #container="{ message, closeCallback }">
      <div class="overflow-hidden rounded-card bg-card shadow-card">
        <div
          :class="['flex items-start gap-3 border p-4', styleFor(message.severity).classes]"
          :data-severity="message.severity"
        >
          <i :class="[styleFor(message.severity).icon, 'mt-0.5']" aria-hidden="true" />
          <div class="flex flex-1 flex-col gap-0.5">
            <p class="text-sm font-semibold">{{ message.summary }}</p>
            <p v-if="message.detail" class="text-sm opacity-90">{{ message.detail }}</p>
          </div>
          <button
            type="button"
            class="cursor-pointer leading-none opacity-70 hover:opacity-100"
            aria-label="Close"
            @click="closeCallback"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </template>
  </Toast>
</template>
