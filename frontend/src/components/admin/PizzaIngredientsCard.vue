<script setup lang="ts">
import Select from "primevue/select";
import { computed } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import IngredientChips from "@/components/pizza/IngredientChips.vue";
import type { Ingredient } from "@/types/pizza.types";

interface PizzaIngredientsCardProps {
  ingredients: Ingredient[];
  loading?: boolean;
  adding?: boolean;
  addError?: string | null;
  disabled?: boolean;
}

interface PizzaIngredientsCardEmits {
  add: [name: string];
}

const {
  ingredients,
  loading,
  adding,
  addError = null,
  disabled,
} = defineProps<PizzaIngredientsCardProps>();
const emit = defineEmits<PizzaIngredientsCardEmits>();

const selectedIds = defineModel<string[]>("selectedIds", { required: true });
const newIngredientName = defineModel<string>("newIngredientName", { default: "" });

const selectedIngredients = computed(() =>
  selectedIds.value.flatMap((id) => ingredients.filter((ingredient) => ingredient.id === id))
);

const canAdd = computed(() => newIngredientName.value.trim().length > 0 && !adding && !disabled);

function removeIngredient(id: string): void {
  selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id);
}

function submitNewIngredient(): void {
  if (canAdd.value) {
    emit("add", newIngredientName.value.trim());
  }
}
</script>

<template>
  <BaseCard>
    <template #header>
      <h2 class="text-section-title">Ingredients</h2>
    </template>

    <Select
      v-model="selectedIds"
      :options="ingredients"
      option-label="name"
      option-value="id"
      multiple
      checkmark
      filter
      filter-placeholder="Search ingredients"
      placeholder="Choose ingredients"
      :loading="loading"
      :disabled="disabled"
      aria-label="Choose ingredients"
      class="w-full"
      data-test="ingredient-select"
    >
      <template #value="{ placeholder }">
        {{ selectedIds.length > 0 ? `${String(selectedIds.length)} selected` : placeholder }}
      </template>
    </Select>

    <IngredientChips
      v-if="selectedIngredients.length > 0"
      :ingredients="selectedIngredients"
      label="Selected"
      removable
      @remove="removeIngredient"
    />
    <p v-else class="text-caption" data-test="no-ingredients">No ingredients added yet</p>

    <div class="flex flex-col gap-1.5">
      <label for="new-ingredient" class="text-label">Add a new ingredient</label>
      <div class="flex gap-2">
        <BaseInput
          id="new-ingredient"
          v-model="newIngredientName"
          placeholder="e.g. Truffle oil"
          :invalid="addError !== null"
          :disabled="disabled"
          class="bg-card-subtle"
          aria-describedby="new-ingredient-error"
          @keydown.enter.prevent="submitNewIngredient"
        />
        <BaseButton
          variant="secondary"
          icon="pi pi-plus"
          label="Add"
          :loading="adding"
          :disabled="!canAdd"
          @click="submitNewIngredient"
        />
      </div>
      <p
        v-if="addError"
        id="new-ingredient-error"
        class="text-sm text-primary"
        data-test="ingredient-error"
      >
        {{ addError }}
      </p>
    </div>
  </BaseCard>
</template>
