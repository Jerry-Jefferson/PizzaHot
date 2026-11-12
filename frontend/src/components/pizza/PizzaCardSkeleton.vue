<script setup lang="ts">
import Skeleton from "primevue/skeleton";
</script>

<template>
  <div
    class="flex flex-col gap-4 overflow-hidden rounded-card border border-border bg-card pb-5 shadow-card"
    aria-hidden="true"
  >
    <Skeleton class="aspect-[16/9]" width="100%" height="auto" border-radius="0" />
    <div class="flex justify-between gap-3 px-5">
      <Skeleton width="60%" height="1.5rem" />
      <Skeleton width="3.5rem" height="1.5rem" />
    </div>
    <div class="flex flex-col gap-2 px-5">
      <Skeleton width="100%" height="0.875rem" />
      <Skeleton width="80%" height="0.875rem" />
    </div>
    <div class="px-5">
      <Skeleton width="100%" height="2rem" />
    </div>
  </div>
</template>
