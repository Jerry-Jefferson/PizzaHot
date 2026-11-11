<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";

import AppLogo from "@/components/layout/AppLogo.vue";
</script>

<template>
  <div class="flex min-h-screen flex-col lg:flex-row">
    <aside
      class="theme-sidebar relative overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:w-1/2 lg:flex-col"
    >
      <span
        class="pointer-events-none absolute -top-24 -left-24 hidden size-80 rounded-full bg-primary/15 lg:block"
        aria-hidden="true"
      />
      <span
        class="pointer-events-none absolute -right-32 -bottom-32 hidden size-96 rounded-full bg-primary/15 lg:block"
        aria-hidden="true"
      />
      <div class="relative px-6 py-4 lg:px-12 lg:pt-12">
        <RouterLink :to="{ name: 'menu' }" aria-label="Pizzeria home" class="inline-flex">
          <AppLogo inverted />
        </RouterLink>
      </div>
      <div class="relative hidden flex-1 flex-col justify-center px-12 pb-12 lg:flex">
        <RouterView name="aside" />
      </div>
    </aside>

    <main class="flex flex-1 items-center justify-center bg-background px-4 py-10 lg:px-12">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>
  </div>
</template>
