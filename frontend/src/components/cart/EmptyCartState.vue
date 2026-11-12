<script setup lang="ts">
import { RouterLink } from "vue-router";

import BaseIconCircle from "@/components/base/BaseIconCircle.vue";
</script>

<template>
  <div class="flex flex-col items-center gap-3 px-4 py-16 text-center" data-test="empty-cart">
    <BaseIconCircle icon="pi pi-shopping-bag" />
    <h2 class="text-label font-bold">Your cart is empty</h2>
    <p class="max-w-sm text-muted-foreground">
      Browse our menu and add some delicious pizzas to your order.
    </p>
    <RouterLink
      :to="{ name: 'menu' }"
      class="mt-2 inline-flex h-10 items-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
    >
      <i class="pi pi-arrow-left text-xs" aria-hidden="true" />
      Browse menu
    </RouterLink>
  </div>
</template>
