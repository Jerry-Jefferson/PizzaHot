<script setup lang="ts">
import AppLogo from "./AppLogo.vue";

const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-border bg-card">
    <div
      class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row"
    >
      <AppLogo class="scale-90" />
      <p class="text-caption">© {{ year }} Pizzeria. All rights reserved.</p>
    </div>
  </footer>
</template>
