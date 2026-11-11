<script setup lang="ts">
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
      <svg
        viewBox="0 0 24 24"
        class="size-5"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3.5 6.5 12 21l8.5-14.5" />
        <path d="M3 6.5C8.5 3.5 15.5 3.5 21 6.5" />
        <circle cx="10" cy="10" r="1.2" fill="currentColor" />
        <circle cx="14" cy="12" r="1.2" fill="currentColor" />
        <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
      </svg>
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
