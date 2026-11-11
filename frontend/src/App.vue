<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import { RouterView } from "vue-router";
</script>

<template>
  <main class="mx-auto min-h-screen max-w-3xl p-6">
    <RouterView />
  </main>
  <Toast position="bottom-right" />
  <ConfirmDialog />
</template>
