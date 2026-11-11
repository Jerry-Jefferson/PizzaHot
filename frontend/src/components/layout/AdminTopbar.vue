<script setup lang="ts">
import { RouterLink } from "vue-router";

import { OrderStatus } from "@/types/order.types";

interface AdminTopbarProps {
  title: string;
  pendingCount: number;
}

interface AdminTopbarEmits {
  openMenu: [];
}

const { title, pendingCount } = defineProps<AdminTopbarProps>();
const emit = defineEmits<AdminTopbarEmits>();
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:px-8"
  >
    <button
      type="button"
      class="flex size-10 cursor-pointer items-center justify-center rounded-lg text-foreground hover:bg-muted lg:hidden"
      aria-label="Open navigation"
      @click="emit('openMenu')"
    >
      <i class="pi pi-bars" aria-hidden="true" />
    </button>
    <h1 class="flex-1 font-display text-2xl font-bold text-foreground">{{ title }}</h1>
    <RouterLink
      v-if="pendingCount > 0"
      :to="{ name: 'admin-orders', query: { status: OrderStatus.PENDING } }"
      data-test="pending-pill"
      class="inline-flex items-center gap-1.5 rounded-full bg-status-warning-bg px-3 py-1 text-xs font-medium text-status-warning-fg"
    >
      <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {{ pendingCount }} pending
    </RouterLink>
  </header>
</template>
