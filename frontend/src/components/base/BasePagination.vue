<script setup lang="ts">
import { computed } from "vue";

import { getPageItems } from "@/utils/pagination";

interface BasePaginationProps {
  totalPages: number;
}

const { totalPages } = defineProps<BasePaginationProps>();

const page = defineModel<number>("page", { required: true });

const items = computed(() => getPageItems(page.value, totalPages));

function goTo(target: number): void {
  if (target >= 1 && target <= totalPages && target !== page.value) {
    page.value = target;
  }
}
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1" aria-label="Pagination">
    <button
      type="button"
      class="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      aria-label="Previous page"
      :disabled="page <= 1"
      @click="goTo(page - 1)"
    >
      <i class="pi pi-chevron-left text-xs" aria-hidden="true" />
    </button>
    <template v-for="item in items" :key="item">
      <span
        v-if="typeof item !== 'number'"
        class="flex size-9 items-center justify-center text-muted-foreground"
        aria-hidden="true"
      >
        …
      </span>
      <button
        v-else
        type="button"
        :class="[
          'flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-colors',
          item === page ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
        ]"
        :aria-current="item === page ? 'page' : undefined"
        :aria-label="`Page ${item}`"
        @click="goTo(item)"
      >
        {{ item }}
      </button>
    </template>
    <button
      type="button"
      class="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      aria-label="Next page"
      :disabled="page >= totalPages"
      @click="goTo(page + 1)"
    >
      <i class="pi pi-chevron-right text-xs" aria-hidden="true" />
    </button>
  </nav>
</template>
