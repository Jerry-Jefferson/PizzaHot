<script setup lang="ts">
import { RouterLink } from "vue-router";

import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
</script>

<template>
  <BaseEmptyState
    icon="pi pi-map"
    title="Page not found"
    description="The page you are looking for doesn't exist or has been moved."
  >
    <template #actions>
      <RouterLink
        :to="{ name: 'menu' }"
        class="inline-flex h-10 items-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <i class="pi pi-arrow-left text-xs" aria-hidden="true" />
        Back to menu
      </RouterLink>
    </template>
  </BaseEmptyState>
</template>
