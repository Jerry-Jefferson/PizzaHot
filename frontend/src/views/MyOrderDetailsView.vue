<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import OrderPlacedBanner from "@/components/order/OrderPlacedBanner.vue";

const route = useRoute();

const isJustPlaced = computed(() => route.query.placed === "1");
</script>

<template>
  <section class="flex flex-col gap-6">
    <h1 class="text-page-title">Order details</h1>
    <OrderPlacedBanner v-if="isJustPlaced" />
    <BaseEmptyState icon="pi pi-wrench" title="Coming soon" />
  </section>
</template>
