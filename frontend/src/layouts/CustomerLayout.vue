<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import AppFooter from "@/components/layout/AppFooter.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import type { UserSummary } from "@/types/user.types";

const route = useRoute();
const router = useRouter();

const user: UserSummary | null = null;
const cartCount = 0;

const currentRouteName = computed(() => (typeof route.name === "string" ? route.name : undefined));

async function signOut(): Promise<void> {
  await router.push({ name: "sign-in" });
}
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
