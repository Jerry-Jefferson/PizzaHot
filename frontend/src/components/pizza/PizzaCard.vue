<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

import BaseButton from "@/components/base/BaseButton.vue";
import type { Pizza } from "@/types/pizza.types";
import { formatPrice } from "@/utils/format";
import { toMediaUrl } from "@/utils/media-url";

interface PizzaCardProps {
  pizza: Pizza;
  cartQuantity?: number;
  adding?: boolean;
}

interface PizzaCardEmits {
  addToCart: [pizza: Pizza];
}

const { pizza, cartQuantity = 0, adding } = defineProps<PizzaCardProps>();
const emit = defineEmits<PizzaCardEmits>();

const ingredientNames = computed(
  () => pizza.ingredients?.map((ingredient) => ingredient.name).join(", ") ?? ""
);
const isInCart = computed(() => cartQuantity > 0);
</script>

<template>
  <article
    class="flex flex-col overflow-hidden rounded-card border border-border bg-card text-card-foreground shadow-card"
  >
    <RouterLink
      :to="{ name: 'pizza-details', params: { id: pizza.id } }"
      class="group flex flex-col gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img
        :src="toMediaUrl(pizza.image)"
        :alt="pizza.name"
        loading="lazy"
        class="aspect-[16/9] w-full bg-card-subtle object-cover"
      />
      <div class="flex items-start justify-between gap-3 px-5">
        <h3 class="text-card-title transition-colors group-hover:text-primary">
          {{ pizza.name }}
        </h3>
        <span class="shrink-0 font-semibold" data-test="pizza-price">
          {{ formatPrice(pizza.price) }}
        </span>
      </div>
    </RouterLink>

    <div class="flex flex-1 flex-col gap-2 px-5 pt-2">
      <p class="line-clamp-2 text-sm text-muted-foreground">{{ pizza.description }}</p>
      <p v-if="ingredientNames" class="text-caption" data-test="pizza-ingredients">
        {{ ingredientNames }}
      </p>
    </div>

    <footer class="px-5 pt-4 pb-5">
      <BaseButton
        size="sm"
        block
        :variant="isInCart ? 'secondary' : 'primary'"
        :icon="isInCart ? 'pi pi-check' : 'pi pi-shopping-cart'"
        :label="isInCart ? `In cart · ${cartQuantity}` : 'Add to cart'"
        :loading="adding"
        :aria-label="`Add ${pizza.name} to cart`"
        @click="emit('addToCart', pizza)"
      />
    </footer>
  </article>
</template>
