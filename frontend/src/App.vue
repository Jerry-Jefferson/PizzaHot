<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import { RouterView } from "vue-router";

import BaseConfirmDialog from "@/components/base/BaseConfirmDialog.vue";
import BaseToast from "@/components/base/BaseToast.vue";
</script>

<template>
  <main class="mx-auto min-h-screen max-w-3xl p-6">
    <RouterView />
  </main>
  <BaseToast />
  <ConfirmDialog />
  <BaseConfirmDialog />
</template>
