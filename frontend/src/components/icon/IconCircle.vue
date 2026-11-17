<script setup lang="ts">
interface IconCircleProps {
  icon: string;
}

const { icon } = defineProps<IconCircleProps>();
</script>

<template>
  <span
    class="flex size-16 shrink-0 items-center justify-center rounded-full bg-card-subtle text-muted-foreground"
  >
    <i :class="[icon, 'text-2xl']" aria-hidden="true" />
  </span>
</template>
