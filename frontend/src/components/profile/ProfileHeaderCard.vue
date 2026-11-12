<script setup lang="ts">
import { computed } from "vue";

import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import type { UserSummary } from "@/types/user.types";
import { toMediaUrl } from "@/utils/media-url";

interface ProfileHeaderCardProps {
  user: UserSummary;
}

const { user } = defineProps<ProfileHeaderCardProps>();

const fullName = computed(
  () => [user.name, user.surname].filter(Boolean).join(" ") || "Your profile"
);
</script>

<template>
  <BaseCard>
    <div class="flex items-center gap-4">
      <BaseAvatar
        size="lg"
        :name="user.name"
        :surname="user.surname"
        :email="user.email"
        :src="user.image ? toMediaUrl(user.image) : null"
      />
      <div class="flex min-w-0 flex-col gap-0.5">
        <h2 class="truncate text-card-title">{{ fullName }}</h2>
        <p class="truncate text-sm text-muted-foreground">{{ user.email }}</p>
      </div>
    </div>
  </BaseCard>
</template>
