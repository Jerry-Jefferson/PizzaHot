<script setup lang="ts">
import type { Pizza } from "@/types/pizza.types";

import PizzaCard from "./PizzaCard.vue";
import PizzaCardSkeleton from "./PizzaCardSkeleton.vue";

interface PizzaGridProps {
  pizzas: Pizza[];
  loading?: boolean;
  skeletonCount?: number;
  cartQuantities?: Record<string, number>;
  addingPizzaIds?: ReadonlySet<string>;
}

interface PizzaGridEmits {
  addToCart: [pizza: Pizza];
}

const {
  pizzas,
  loading,
  skeletonCount = 6,
  cartQuantities = {},
  addingPizzaIds = new Set<string>(),
} = defineProps<PizzaGridProps>();
const emit = defineEmits<PizzaGridEmits>();
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" :aria-busy="loading">
    <template v-if="loading">
      <PizzaCardSkeleton v-for="index in skeletonCount" :key="index" />
    </template>
    <template v-else>
      <PizzaCard
        v-for="pizza in pizzas"
        :key="pizza.id"
        :pizza="pizza"
        :cart-quantity="cartQuantities[pizza.id] ?? 0"
        :adding="addingPizzaIds.has(pizza.id)"
        @add-to-cart="emit('addToCart', $event)"
      />
    </template>
  </div>
</template>
