<script setup lang="ts">
import Skeleton from "primevue/skeleton";
</script>

<template>
  <div class="grid gap-10 lg:grid-cols-2" aria-hidden="true" data-test="pizza-details-skeleton">
    <Skeleton class="aspect-square" width="100%" height="auto" border-radius="1rem" />
    <div class="flex flex-col gap-4">
      <Skeleton width="70%" height="2.5rem" />
      <Skeleton width="100%" height="1.25rem" />
      <Skeleton width="85%" height="1.25rem" />
      <div class="flex gap-2">
        <Skeleton width="5rem" height="1.75rem" border-radius="9999px" />
        <Skeleton width="6rem" height="1.75rem" border-radius="9999px" />
        <Skeleton width="4.5rem" height="1.75rem" border-radius="9999px" />
      </div>
      <Skeleton width="100%" height="3rem" />
      <Skeleton width="100%" height="3rem" />
    </div>
  </div>
</template>
