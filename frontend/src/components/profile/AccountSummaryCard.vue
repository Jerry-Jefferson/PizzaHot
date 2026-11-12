<script setup lang="ts">
import { computed } from "vue";

import BaseCard from "@/components/base/BaseCard.vue";
import BaseStatTile from "@/components/base/BaseStatTile.vue";
import { formatMonthYear } from "@/utils/format";

interface AccountSummaryCardProps {
  totalOrders?: number | null;
  memberSince: string;
}

const { totalOrders = null, memberSince } = defineProps<AccountSummaryCardProps>();

const totalOrdersLabel = computed(() => totalOrders ?? "—");
</script>

<template>
  <BaseCard>
    <template #header>
      <h2 class="text-section-title">Account summary</h2>
    </template>
    <div class="grid gap-4 sm:grid-cols-2">
      <BaseStatTile :value="totalOrdersLabel" label="Total orders" data-test="total-orders" />
      <BaseStatTile
        :value="formatMonthYear(memberSince)"
        label="Member since"
        data-test="member-since"
      />
    </div>
  </BaseCard>
</template>
