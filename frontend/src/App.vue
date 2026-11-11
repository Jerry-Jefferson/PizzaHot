<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import { type Component, computed } from "vue";
import { RouterView, useRoute } from "vue-router";

import BaseConfirmDialog from "@/components/base/BaseConfirmDialog.vue";
import BaseToast from "@/components/base/BaseToast.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import CustomerLayout from "@/layouts/CustomerLayout.vue";
import type { AppLayout } from "@/types/router.types";

const LAYOUTS: Record<AppLayout, Component> = {
  auth: AuthLayout,
  customer: CustomerLayout,
  admin: AdminLayout,
};

const route = useRoute();

const layout = computed(() => (route.matched.length > 0 ? LAYOUTS[route.meta.layout] : undefined));
</script>

<template>
  <component :is="layout" v-if="layout">
    <RouterView />
  </component>
  <BaseToast />
  <ConfirmDialog />
  <BaseConfirmDialog />
</template>
