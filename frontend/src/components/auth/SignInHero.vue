<script setup lang="ts">
import AuthHeroPanel from "./AuthHeroPanel.vue";

const CHIPS = ["Wood-fired", "Organic", "35 min delivery"];
</script>

<template>
  <AuthHeroPanel
    headline="Craft. Fire. Deliver."
    subtitle="Hand-stretched dough, slow-fermented for 48 hours and baked in a stone oven — straight to your door."
    :chips="CHIPS"
  >
    <template #footnote>Trusted by pizza lovers across the city.</template>
  </AuthHeroPanel>
</template>
