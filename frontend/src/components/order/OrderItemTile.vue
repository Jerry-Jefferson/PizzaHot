<script setup lang="ts">
import BasePizzaIcon from "@/components/base/BasePizzaIcon.vue";

interface OrderItemTileProps {
  size?: "sm" | "md";
}

const { size = "md" } = defineProps<OrderItemTileProps>();
</script>

<template>
  <span
    :class="[
      'flex shrink-0 items-center justify-center rounded-xl bg-card-subtle text-muted-foreground',
      size === 'sm' ? 'size-10' : 'size-14',
    ]"
  >
    <BasePizzaIcon :class="size === 'sm' ? 'size-5' : 'size-6'" />
  </span>
</template>
