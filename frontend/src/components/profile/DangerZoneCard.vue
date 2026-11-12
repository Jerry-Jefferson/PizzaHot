<script setup lang="ts">
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";

interface DangerZoneCardEmits {
  delete: [];
}

const emit = defineEmits<DangerZoneCardEmits>();
</script>

<template>
  <BaseCard>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1">
        <h2 class="text-label font-semibold tracking-wide text-primary uppercase">Danger zone</h2>
        <p class="text-sm text-muted-foreground">
          Permanently delete your account. This action cannot be undone.
        </p>
      </div>
      <BaseButton
        variant="danger-outline"
        icon="pi pi-trash"
        label="Delete my account"
        @click="emit('delete')"
      />
    </div>
  </BaseCard>
</template>
