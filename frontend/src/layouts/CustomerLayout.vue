<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRoute } from "vue-router";

import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import { useCartItemCount } from "@/composables/useCart";
import { useRefreshSession } from "@/composables/useRefreshSession";
import { useSignOut } from "@/composables/useSignOut";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const { user, isAuthenticated, isAdmin, isEmailVerified } = storeToRefs(useAuthStore());
const { signOut } = useSignOut();
const { isRefreshing, refreshSession } = useRefreshSession();

const cartCount = useCartItemCount();

const currentRouteName = computed(() => (typeof route.name === "string" ? route.name : undefined));
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader
      :user="user"
      :cart-count="cartCount"
      :current-route-name="currentRouteName"
      :show-admin-link="isAdmin"
      @sign-out="signOut"
    />
    <EmailVerificationBanner
      v-if="isAuthenticated && !isEmailVerified"
      :loading="isRefreshing"
      @refresh="refreshSession"
    />
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
