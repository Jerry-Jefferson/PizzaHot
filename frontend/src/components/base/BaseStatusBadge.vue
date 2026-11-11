<script setup lang="ts">
import type { StatusTone } from "@/types/ui.types";

interface BaseStatusBadgeProps {
  tone?: StatusTone;
  dot?: boolean;
}

const { tone = "neutral", dot } = defineProps<BaseStatusBadgeProps>();

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-status-success-bg text-status-success-fg",
  warning: "bg-status-warning-bg text-status-warning-fg",
  info: "bg-status-info-bg text-status-info-fg",
  processing: "bg-status-processing-bg text-status-processing-fg",
  danger: "bg-primary/10 text-primary",
  neutral: "bg-secondary text-secondary-foreground",
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
      TONE_CLASSES[tone],
    ]"
    :data-tone="tone"
  >
    <span v-if="dot" class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    <slot />
  </span>
</template>
