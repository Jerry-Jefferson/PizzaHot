<script setup lang="ts">
import IconCircle from "@/components/icon/IconCircle.vue";

interface BaseEmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

const { title, description, icon = "pi pi-inbox" } = defineProps<BaseEmptyStateProps>();
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-4 py-12 text-center">
    <IconCircle :icon="icon" />
    <h3 class="text-card-title text-foreground">{{ title }}</h3>
    <p v-if="description" class="max-w-sm text-sm text-muted-foreground">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-2">
      <slot name="actions" />
    </div>
  </div>
</template>
