<script setup lang="ts">
interface BaseStatTileProps {
  value: string | number;
  label: string;
  icon?: string;
}

const { value, label, icon } = defineProps<BaseStatTileProps>();
</script>

<template>
  <div class="flex flex-col gap-1 rounded-xl bg-card-subtle p-4">
    <i v-if="icon" :class="[icon, 'mb-1 text-muted-foreground']" aria-hidden="true" />
    <span class="font-display text-3xl font-bold text-foreground">{{ value }}</span>
    <span class="text-caption">{{ label }}</span>
  </div>
</template>
