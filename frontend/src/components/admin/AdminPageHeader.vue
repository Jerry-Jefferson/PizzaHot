<script setup lang="ts">
interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
}

const { title, subtitle } = defineProps<AdminPageHeaderProps>();
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-4">
    <div class="flex flex-col gap-1">
      <h2 class="font-display text-section-title">{{ title }}</h2>
      <p v-if="subtitle" class="text-caption" data-test="page-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
