<script setup lang="ts">
import type { Ingredient } from "@/types/pizza.types";

interface IngredientChipsProps {
  ingredients: Pick<Ingredient, "id" | "name">[];
  label?: string;
  removable?: boolean;
}

interface IngredientChipsEmits {
  remove: [ingredientId: string];
}

const { ingredients, label = "Ingredients", removable } = defineProps<IngredientChipsProps>();
const emit = defineEmits<IngredientChipsEmits>();
</script>

<template>
  <div v-if="ingredients.length > 0" class="flex flex-col gap-2">
    <span class="text-label">{{ label }}</span>
    <ul class="flex flex-wrap gap-2">
      <li
        v-for="ingredient in ingredients"
        :key="ingredient.id"
        class="inline-flex items-center gap-1.5 rounded-full border border-border bg-card-subtle px-3 py-1 text-sm"
      >
        {{ ingredient.name }}
        <button
          v-if="removable"
          type="button"
          class="flex size-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          :aria-label="`Remove ${ingredient.name}`"
          @click="emit('remove', ingredient.id)"
        >
          <i class="pi pi-times text-[0.625rem]" aria-hidden="true" />
        </button>
      </li>
    </ul>
  </div>
</template>
