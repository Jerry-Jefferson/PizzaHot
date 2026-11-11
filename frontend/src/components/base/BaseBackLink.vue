<script setup lang="ts">
import { type RouteLocationRaw, RouterLink } from "vue-router";

interface BaseBackLinkProps {
  to: RouteLocationRaw;
  label: string;
}

const { to, label } = defineProps<BaseBackLinkProps>();
</script>

<template>
  <RouterLink
    :to="to"
    class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
  >
    <i class="pi pi-arrow-left text-xs" aria-hidden="true" />
    {{ label }}
  </RouterLink>
</template>
