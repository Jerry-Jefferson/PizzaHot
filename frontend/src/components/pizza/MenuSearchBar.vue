<script setup lang="ts">
import BaseInput from "@/components/base/BaseInput.vue";

const model = defineModel<string>({ default: "" });
</script>

<template>
  <BaseInput
    v-model="model"
    type="search"
    icon="pi pi-search"
    placeholder="Search pizzas…"
    aria-label="Search pizzas"
    :class="{ 'border-primary/40': model.trim() }"
  />
</template>
