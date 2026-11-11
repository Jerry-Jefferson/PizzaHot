<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRoute } from "vue-router";

import AppFooter from "@/components/layout/AppFooter.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import { useSignOut } from "@/composables/useSignOut";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const { user } = storeToRefs(useAuthStore());
const { signOut } = useSignOut();

const cartCount = 0;

const currentRouteName = computed(() => (typeof route.name === "string" ? route.name : undefined));
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader
      :user="user"
      :cart-count="cartCount"
      :current-route-name="currentRouteName"
      @sign-out="signOut"
    />
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
