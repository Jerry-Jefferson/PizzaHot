<script setup lang="ts">
import { computed } from "vue";

import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseStatusBadge from "@/components/base/BaseStatusBadge.vue";
import BaseSubtlePanel from "@/components/base/BaseSubtlePanel.vue";
import type { UserSummary } from "@/types/user.types";
import { ADMIN_ROLE_BADGE_LABEL } from "@/utils/constants/user.constants";
import { toMediaUrl } from "@/utils/media";
import { getUserDisplayName } from "@/utils/user";

interface AdminProfileHeaderProps {
  user: UserSummary;
}

const { user } = defineProps<AdminProfileHeaderProps>();

const displayName = computed(() => getUserDisplayName(user));
</script>

<template>
  <BaseSubtlePanel>
    <div class="flex flex-wrap items-center gap-4">
      <BaseAvatar
        size="lg"
        :name="user.name"
        :surname="user.surname"
        :email="user.email"
        :src="user.image ? toMediaUrl(user.image) : null"
      />
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 class="truncate text-card-title" data-test="admin-name">{{ displayName }}</h3>
        <p class="truncate text-sm text-muted-foreground" data-test="admin-email">
          {{ user.email }}
        </p>
      </div>
      <BaseStatusBadge tone="primary" data-test="admin-badge">
        {{ ADMIN_ROLE_BADGE_LABEL }}
      </BaseStatusBadge>
    </div>
  </BaseSubtlePanel>
</template>
