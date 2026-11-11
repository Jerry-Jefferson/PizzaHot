<script setup lang="ts">
import { RouterLink } from "vue-router";

import type { UserSummary } from "@/types/user.types";

import AdminSidebarUser from "./AdminSidebarUser.vue";
import AppLogo from "./AppLogo.vue";

interface SidebarItem {
  label: string;
  icon: string;
  routeName: string;
  matches: string[];
  showsPendingCount?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface AdminSidebarProps {
  user: UserSummary | null;
  pendingCount: number;
  currentRouteName?: string;
}

interface AdminSidebarEmits {
  navigate: [];
  signOut: [];
}

const { user, pendingCount, currentRouteName } = defineProps<AdminSidebarProps>();
const emit = defineEmits<AdminSidebarEmits>();

const SECTIONS: SidebarSection[] = [
  {
    title: "Management",
    items: [
      {
        label: "Dashboard",
        icon: "pi pi-th-large",
        routeName: "admin-dashboard",
        matches: ["admin-dashboard"],
      },
      {
        label: "Pizzas",
        icon: "pi pi-box",
        routeName: "admin-pizzas",
        matches: ["admin-pizzas", "admin-pizza-new", "admin-pizza-edit"],
      },
      {
        label: "Orders",
        icon: "pi pi-receipt",
        routeName: "admin-orders",
        matches: ["admin-orders"],
        showsPendingCount: true,
      },
      { label: "Users", icon: "pi pi-users", routeName: "admin-users", matches: ["admin-users"] },
      {
        label: "Promo codes",
        icon: "pi pi-tag",
        routeName: "admin-promocodes",
        matches: ["admin-promocodes"],
      },
      {
        label: "Analytics",
        icon: "pi pi-chart-bar",
        routeName: "admin-analytics",
        matches: ["admin-analytics"],
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        icon: "pi pi-user",
        routeName: "admin-profile",
        matches: ["admin-profile"],
      },
    ],
  },
];

const isActive = (item: SidebarItem): boolean =>
  currentRouteName !== undefined && item.matches.includes(currentRouteName);
</script>

<template>
  <div class="theme-sidebar flex h-full flex-col bg-sidebar text-sidebar-foreground">
    <div class="px-5 py-6">
      <RouterLink :to="{ name: 'admin-dashboard' }" aria-label="Admin dashboard">
        <AppLogo inverted />
      </RouterLink>
    </div>

    <nav class="flex flex-1 flex-col gap-6 overflow-y-auto px-3" aria-label="Admin">
      <div v-for="section in SECTIONS" :key="section.title" class="flex flex-col gap-1">
        <p class="px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-muted uppercase">
          {{ section.title }}
        </p>
        <RouterLink
          v-for="item in section.items"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          :aria-current="isActive(item) ? 'page' : undefined"
          :class="[
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            isActive(item)
              ? 'bg-primary text-primary-foreground'
              : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground',
          ]"
          @click="emit('navigate')"
        >
          <i :class="item.icon" aria-hidden="true" />
          <span class="flex-1">{{ item.label }}</span>
          <span
            v-if="item.showsPendingCount && pendingCount > 0"
            data-test="pending-count"
            :class="[
              'min-w-5 rounded-full px-1.5 text-center text-xs leading-5 font-semibold',
              isActive(item)
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-primary text-primary-foreground',
            ]"
          >
            {{ pendingCount }}
          </span>
        </RouterLink>
      </div>
    </nav>

    <AdminSidebarUser :user="user" @sign-out="emit('signOut')" />
  </div>
</template>
