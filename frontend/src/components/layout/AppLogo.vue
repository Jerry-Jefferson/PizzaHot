<script setup lang="ts">
import BasePizzaIcon from "@/components/base/BasePizzaIcon.vue";

interface AppLogoProps {
  inverted?: boolean;
}

const { inverted } = defineProps<AppLogoProps>();
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <span
      class="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
      aria-hidden="true"
    >
      <BasePizzaIcon class="size-5" />
    </span>
    <span
      :class="[
        'font-display text-xl font-bold',
        inverted ? 'text-sidebar-foreground' : 'text-foreground',
      ]"
    >
      Pizzeria
    </span>
  </span>
</template>
