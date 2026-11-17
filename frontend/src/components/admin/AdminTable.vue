<script setup lang="ts" generic="TRow extends object">
import DataTable from "primevue/datatable";
import Skeleton from "primevue/skeleton";

import BaseEmptyState from "@/components/base/BaseEmptyState.vue";

interface AdminTableProps {
  rows: TRow[];
  dataKey: string;
  loading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
}

const {
  rows,
  dataKey,
  loading,
  skeletonRows = 5,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyIcon,
} = defineProps<AdminTableProps>();
</script>

<template>
  <div class="overflow-hidden rounded-card border border-border bg-card shadow-card">
    <div v-if="loading" class="flex flex-col divide-y divide-border" data-test="table-skeleton">
      <div v-for="index in skeletonRows" :key="index" class="px-4 py-4">
        <Skeleton height="1.25rem" />
      </div>
    </div>
    <DataTable
      v-else
      :value="rows"
      :data-key="dataKey"
      :pt="{
        tableContainer: { class: 'overflow-x-auto' },
        bodyRow: { class: 'border-t border-border' },
        column: {
          headerCell: { class: 'bg-card-subtle px-4 py-3 text-left text-table-head' },
          bodyCell: { class: 'px-4 py-3 text-sm text-foreground' },
        },
      }"
    >
      <slot />
      <template #empty>
        <slot name="empty">
          <BaseEmptyState :title="emptyTitle" :description="emptyDescription" :icon="emptyIcon" />
        </slot>
      </template>
    </DataTable>
  </div>
</template>
