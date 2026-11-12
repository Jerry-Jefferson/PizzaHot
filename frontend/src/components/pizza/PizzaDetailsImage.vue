<script setup lang="ts">
import { computed } from "vue";

import { toMediaUrl } from "@/utils/media-url";

interface PizzaDetailsImageProps {
  image: string | null;
  alt: string;
}

const { image, alt } = defineProps<PizzaDetailsImageProps>();

const source = computed(() => (image ? toMediaUrl(image) : null));
</script>

<template>
  <div class="aspect-square overflow-hidden rounded-card bg-card-subtle">
    <img v-if="source" :src="source" :alt="alt" class="size-full object-cover" />
    <div
      v-else
      class="flex size-full items-center justify-center text-muted-foreground"
      data-test="pizza-image-placeholder"
    >
      <i class="pi pi-image text-5xl" aria-hidden="true" />
      <span class="sr-only">{{ alt }}</span>
    </div>
  </div>
</template>
