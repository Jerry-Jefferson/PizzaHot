<script setup lang="ts">
import { storeToRefs } from "pinia";
import Drawer from "primevue/drawer";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import AdminSidebar from "@/components/layout/AdminSidebar.vue";
import AdminTopbar from "@/components/layout/AdminTopbar.vue";
import { useSignOut } from "@/composables/useSignOut";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const { user } = storeToRefs(useAuthStore());
const { signOut } = useSignOut();

const pendingCount = 0;

const isDrawerOpen = ref(false);

const currentRouteName = computed(() => (typeof route.name === "string" ? route.name : undefined));
const title = computed(() => route.meta.title ?? "Admin");
</script>

<template>
  <div class="min-h-screen bg-background">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">
      <AdminSidebar
        :user="user"
        :pending-count="pendingCount"
        :current-route-name="currentRouteName"
        @sign-out="signOut"
      />
    </aside>

    <Drawer
      v-model:visible="isDrawerOpen"
      position="left"
      :show-close-icon="false"
      class="w-60"
      :pt="{
        root: { class: 'border-0 bg-sidebar' },
        header: { class: 'hidden' },
        content: { class: 'p-0' },
      }"
    >
      <AdminSidebar
        :user="user"
        :pending-count="pendingCount"
        :current-route-name="currentRouteName"
        @navigate="isDrawerOpen = false"
        @sign-out="signOut"
      />
    </Drawer>

    <div class="flex min-h-screen flex-col lg:pl-60">
      <AdminTopbar :title="title" :pending-count="pendingCount" @open-menu="isDrawerOpen = true" />
      <main class="flex-1 p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
