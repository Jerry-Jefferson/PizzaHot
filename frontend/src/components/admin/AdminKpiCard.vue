<script setup lang="ts">
import Skeleton from "primevue/skeleton";

import type { StatusTone } from "@/types/ui.types";

interface AdminKpiCardProps {
  label: string;
  icon: string;
  tone: StatusTone;
  value?: string | number | null;
  caption?: string;
  loading?: boolean;
}

const { label, icon, tone, value = null, caption, loading } = defineProps<AdminKpiCardProps>();

const ICON_CHIP_CLASSES: Record<StatusTone, string> = {
  success: "bg-status-success-bg text-status-success-fg",
  warning: "bg-status-warning-bg text-status-warning-fg",
  info: "bg-status-info-bg text-status-info-fg",
  processing: "bg-status-processing-bg text-status-processing-fg",
  danger: "bg-primary/10 text-primary",
  neutral: "bg-secondary text-secondary-foreground",
};
</script>

<template>
  <article
    class="flex items-start gap-4 rounded-card border border-border bg-card p-5 text-card-foreground shadow-card"
  >
    <span
      :class="[
        'flex size-11 shrink-0 items-center justify-center rounded-xl text-lg',
        ICON_CHIP_CLASSES[tone],
      ]"
      aria-hidden="true"
      data-test="kpi-icon"
    >
      <i :class="icon" />
    </span>
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="text-caption">{{ label }}</span>
      <Skeleton v-if="loading" width="6rem" height="2rem" data-test="kpi-skeleton" />
      <template v-else>
        <span
          class="truncate font-display text-2xl font-bold text-foreground"
          data-test="kpi-value"
        >
          {{ value ?? "—" }}
        </span>
        <span v-if="caption" class="text-caption" data-test="kpi-caption">{{ caption }}</span>
      </template>
    </div>
  </article>
</template>
