<script setup lang="ts">
interface BaseIconCircleProps {
  icon: string;
}

const { icon } = defineProps<BaseIconCircleProps>();
</script>

<template>
  <span
    class="flex size-16 shrink-0 items-center justify-center rounded-full bg-card-subtle text-muted-foreground"
  >
    <i :class="[icon, 'text-2xl']" aria-hidden="true" />
  </span>
</template>
