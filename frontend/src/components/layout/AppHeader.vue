<script setup lang="ts">
import Drawer from "primevue/drawer";
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

import BaseAvatar from "@/components/base/BaseAvatar.vue";
import type { UserSummary } from "@/types/user.types";

import AppLogo from "./AppLogo.vue";

interface NavItem {
  label: string;
  routeName: string;
  matches: string[];
}

interface AppHeaderProps {
  user: UserSummary | null;
  cartCount: number;
  currentRouteName?: string;
}

interface AppHeaderEmits {
  signOut: [];
}

const { user, cartCount, currentRouteName } = defineProps<AppHeaderProps>();
const emit = defineEmits<AppHeaderEmits>();

const NAV_ITEMS: NavItem[] = [
  { label: "Menu", routeName: "menu", matches: ["menu", "pizza-details"] },
  { label: "Orders", routeName: "my-orders", matches: ["my-orders", "my-order-details"] },
  { label: "Profile", routeName: "profile", matches: ["profile"] },
];

const CART_ROUTES = ["cart", "checkout"];

const isDrawerOpen = ref(false);

const isActive = (item: NavItem): boolean =>
  currentRouteName !== undefined && item.matches.includes(currentRouteName);

const isCartHighlighted = computed(
  () => cartCount > 0 || (currentRouteName !== undefined && CART_ROUTES.includes(currentRouteName))
);

const cartLabel = computed(() =>
  cartCount > 0 ? `Cart, ${String(cartCount)} items` : "Cart, empty"
);
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-border bg-card">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
      <button
        type="button"
        class="flex size-10 cursor-pointer items-center justify-center rounded-lg text-foreground hover:bg-muted md:hidden"
        aria-label="Open navigation"
        @click="isDrawerOpen = true"
      >
        <i class="pi pi-bars" aria-hidden="true" />
      </button>

      <RouterLink :to="{ name: 'menu' }" aria-label="Pizzeria home">
        <AppLogo />
      </RouterLink>

      <nav class="hidden flex-1 justify-center gap-1 md:flex" aria-label="Main">
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          :aria-current="isActive(item) ? 'page' : undefined"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            isActive(item)
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground',
          ]"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <RouterLink
          :to="{ name: 'cart' }"
          :aria-label="cartLabel"
          data-test="cart-button"
          :data-highlighted="isCartHighlighted"
          :class="[
            'inline-flex h-10 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors',
            isCartHighlighted
              ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
              : 'text-foreground hover:bg-muted',
          ]"
        >
          <i class="pi pi-shopping-cart" aria-hidden="true" />
          <span class="hidden sm:inline">Cart</span>
          <span
            v-if="cartCount > 0"
            data-test="cart-count"
            :class="[
              'min-w-5 rounded-full px-1.5 text-center text-xs leading-5 font-semibold',
              isCartHighlighted
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-primary text-primary-foreground',
            ]"
          >
            {{ cartCount }}
          </span>
        </RouterLink>

        <template v-if="user">
          <BaseAvatar
            :name="user.name"
            :surname="user.surname"
            :email="user.email"
            :src="user.image"
            size="sm"
          />
          <button
            type="button"
            class="flex size-10 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Sign out"
            @click="emit('signOut')"
          >
            <i class="pi pi-sign-out" aria-hidden="true" />
          </button>
        </template>
        <RouterLink
          v-else
          :to="{ name: 'sign-in' }"
          class="inline-flex h-10 items-center rounded-control px-3 text-sm font-medium text-primary hover:bg-primary/10"
        >
          Sign in
        </RouterLink>
      </div>
    </div>

    <Drawer v-model:visible="isDrawerOpen" header="Menu" position="left" class="w-72">
      <nav class="flex flex-col gap-1" aria-label="Main">
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          :aria-current="isActive(item) ? 'page' : undefined"
          :class="[
            'rounded-lg px-4 py-3 text-sm font-medium',
            isActive(item) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
          ]"
          @click="isDrawerOpen = false"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </Drawer>
  </header>
</template>
