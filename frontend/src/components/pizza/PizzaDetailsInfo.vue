<script setup lang="ts">
interface PizzaDetailsInfoProps {
  name: string;
  description: string;
}

const { name, description } = defineProps<PizzaDetailsInfoProps>();
</script>

<template>
  <div class="flex flex-col gap-3">
    <h1 class="text-page-title">{{ name }}</h1>
    <p class="text-lg text-muted-foreground">{{ description }}</p>
  </div>
</template>
