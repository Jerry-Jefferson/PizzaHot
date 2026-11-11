<script setup lang="ts">
import { computed } from "vue";

import BaseAvatar from "@/components/base/BaseAvatar.vue";
import type { UserSummary } from "@/types/user.types";

interface AdminSidebarUserProps {
  user: UserSummary | null;
}

interface AdminSidebarUserEmits {
  signOut: [];
}

const { user } = defineProps<AdminSidebarUserProps>();
const emit = defineEmits<AdminSidebarUserEmits>();

const displayName = computed(() => {
  const fullName = [user?.name, user?.surname].filter(Boolean).join(" ");
  return fullName.length > 0 ? fullName : "Administrator";
});
</script>

<template>
  <div class="flex flex-col gap-3 border-t border-sidebar-border p-4">
    <div v-if="user" class="flex items-center gap-3">
      <BaseAvatar
        :name="user.name"
        :surname="user.surname"
        :email="user.email"
        :src="user.image"
        size="md"
      />
      <div class="flex min-w-0 flex-col">
        <span class="truncate text-sm font-semibold text-sidebar-foreground">
          {{ displayName }}
        </span>
        <span class="truncate text-xs text-sidebar-muted">{{ user.email }}</span>
      </div>
    </div>
    <button
      type="button"
      class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      @click="emit('signOut')"
    >
      <i class="pi pi-sign-out" aria-hidden="true" />
      Sign out
    </button>
  </div>
</template>
