<script setup lang="ts">
import AuthHeroPanel from "./AuthHeroPanel.vue";

const BENEFITS = [
  "Order from the full menu in a few taps",
  "Follow the status of every order",
  "Apply promo codes at checkout",
];
</script>

<template>
  <AuthHeroPanel
    headline="Join the famiglia."
    subtitle="Create an account to order your favourite pizzas and keep all your orders in one place."
  >
    <ul class="flex flex-col gap-3" aria-label="Account benefits">
      <li
        v-for="benefit in BENEFITS"
        :key="benefit"
        class="flex items-center gap-3 text-sm text-sidebar-foreground"
      >
        <span
          class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary"
          aria-hidden="true"
        >
          <i class="pi pi-check text-xs" />
        </span>
        {{ benefit }}
      </li>
    </ul>
  </AuthHeroPanel>
</template>
