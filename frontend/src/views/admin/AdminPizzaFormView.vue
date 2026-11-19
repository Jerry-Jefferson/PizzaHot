<script setup lang="ts">
import Skeleton from "primevue/skeleton";
import { computed, ref } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";

import AdminPageHeader from "@/components/admin/AdminPageHeader.vue";
import PizzaBasicInfoCard from "@/components/admin/PizzaBasicInfoCard.vue";
import PizzaImageCard from "@/components/admin/PizzaImageCard.vue";
import PizzaIngredientsCard from "@/components/admin/PizzaIngredientsCard.vue";
import BaseBackLink from "@/components/base/BaseBackLink.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BaseFormAlert from "@/components/base/BaseFormAlert.vue";
import { useCreateIngredient, useIngredients } from "@/composables/catalog/useIngredients";
import { usePizzaForm } from "@/composables/catalog/usePizzaForm";
import {
  useCreatePizza,
  usePizza,
  useUpdatePizza,
  useUploadPizzaImage,
} from "@/composables/catalog/usePizzas";
import { useAppToast } from "@/composables/common/useAppToast";
import { useConfirmDanger } from "@/composables/common/useConfirmDanger";
import type { Ingredient, Pizza } from "@/types/pizza.types";
import { ROUTES } from "@/utils/constants/routes.constants";
import { getErrorMessage } from "@/utils/errors";
import { toMediaUrl } from "@/utils/media";

const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useAppToast();
const confirmDanger = useConfirmDanger();

const pizzaId = computed(() => (typeof route.params.id === "string" ? route.params.id : null));
const isEditing = computed(() => pizzaId.value !== null);

const pizzaQuery = usePizza(() => pizzaId.value ?? "", { enabled: isEditing });
const editedPizza = computed(() => (isEditing.value ? pizzaQuery.data.value : undefined));

const {
  form,
  ingredientIds,
  originalName,
  isDirty,
  errors,
  formError,
  touch,
  validate,
  toPayload,
  markSaved,
  applyServerError,
} = usePizzaForm(editedPizza);

const ingredientsQuery = useIngredients();
const createIngredient = useCreateIngredient();
const createPizza = useCreatePizza();
const updatePizza = useUpdatePizza();
const uploadImage = useUploadPizzaImage();

const imageFile = ref<File | null>(null);
const newIngredientName = ref("");
const ingredientError = ref<string | null>(null);
const isSaving = ref(false);
const skipLeaveGuard = ref(false);

const ingredients = computed(() => ingredientsQuery.data.value ?? []);
const hasUnsavedChanges = computed(() => isDirty.value || imageFile.value !== null);
const isLoadingPizza = computed(() => isEditing.value && pizzaQuery.isPending.value);
const isPizzaMissing = computed(
  () => isEditing.value && pizzaQuery.isError.value && !pizzaQuery.data.value
);
const currentImageUrl = computed(() =>
  editedPizza.value?.image ? toMediaUrl(editedPizza.value.image) : null
);

const title = computed(() => (isEditing.value ? "Edit Pizza" : "Add New Pizza"));
const subtitle = computed(() =>
  isEditing.value
    ? `Editing: ${originalName.value}`
    : "Fill in the details to add a new pizza to the menu."
);
const submitLabel = computed(() => (isEditing.value ? "Save changes" : "Add pizza"));
const canSubmit = computed(() => !isEditing.value || hasUnsavedChanges.value);

function selectIngredient(id: string): void {
  if (!ingredientIds.value.includes(id)) {
    ingredientIds.value = [...ingredientIds.value, id];
  }
}

function findIngredientByName(name: string): Ingredient | undefined {
  const wanted = name.toLowerCase();
  return ingredients.value.find((ingredient) => ingredient.name.toLowerCase() === wanted);
}

async function addIngredient(name: string): Promise<void> {
  ingredientError.value = null;
  const existing = findIngredientByName(name);
  if (existing) {
    selectIngredient(existing.id);
    newIngredientName.value = "";
    return;
  }
  try {
    const created = await createIngredient.mutateAsync(name);
    selectIngredient(created.id);
    newIngredientName.value = "";
  } catch (error) {
    ingredientError.value = getErrorMessage(error);
  }
}

async function leaveTo(location: Parameters<typeof router.push>[0]): Promise<void> {
  skipLeaveGuard.value = true;
  await router.push(location);
}

async function savePizza(): Promise<Pizza> {
  const payload = toPayload();
  const id = pizzaId.value;
  return id ? updatePizza.mutateAsync({ id, payload }) : createPizza.mutateAsync(payload);
}

async function handleImageFailure(savedPizza: Pizza | null, error: unknown): Promise<void> {
  const summary = isEditing.value
    ? "Changes saved, but the image wasn't uploaded"
    : "Pizza added, but the image wasn't uploaded";
  showError(error, summary);
  if (!savedPizza) {
    return;
  }
  markSaved(savedPizza);
  if (!isEditing.value) {
    skipLeaveGuard.value = true;
    await router.replace({ name: ROUTES.ADMIN_PIZZAS_EDIT.NAME, params: { id: savedPizza.id } });
    skipLeaveGuard.value = false;
  }
}

async function submit(): Promise<void> {
  if (isSaving.value || !canSubmit.value || !(await validate())) {
    return;
  }
  isSaving.value = true;
  const wasEditing = isEditing.value;
  try {
    const savedPizza = wasEditing && !isDirty.value ? null : await savePizza();
    const targetId = savedPizza?.id ?? pizzaId.value;
    if (imageFile.value && targetId) {
      try {
        await uploadImage.mutateAsync({ id: targetId, image: imageFile.value });
      } catch (error) {
        await handleImageFailure(savedPizza, error);
        return;
      }
    }
    showSuccess(wasEditing ? "Pizza updated" : "Pizza added");
    await leaveTo({ name: ROUTES.ADMIN_PIZZAS.NAME });
  } catch (error) {
    applyServerError(error);
  } finally {
    isSaving.value = false;
  }
}

async function cancel(): Promise<void> {
  await router.push({ name: ROUTES.ADMIN_PIZZAS.NAME });
}

function confirmDiscard(): Promise<boolean> {
  return new Promise((resolve) => {
    confirmDanger({
      title: "Discard unsaved changes?",
      message: "Your changes to this pizza haven't been saved and will be lost.",
      confirmLabel: "Discard changes",
      cancelLabel: "Keep editing",
      onConfirm: () => {
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
    });
  });
}

onBeforeRouteLeave(() => {
  if (skipLeaveGuard.value || !hasUnsavedChanges.value) {
    return true;
  }
  return confirmDiscard();
});
</script>

<template>
  <section class="flex flex-col gap-6">
    <BaseBackLink :to="{ name: ROUTES.ADMIN_PIZZAS.NAME }" label="Back to pizzas" />

    <div v-if="isLoadingPizza" class="grid gap-6 lg:grid-cols-[3fr_2fr]" data-test="form-skeleton">
      <Skeleton height="24rem" border-radius="1rem" />
      <Skeleton height="18rem" border-radius="1rem" />
    </div>

    <BaseEmptyState
      v-else-if="isPizzaMissing"
      icon="pi pi-exclamation-circle"
      title="Pizza not found"
      description="It may have been deleted. Go back to the list and try again."
    />

    <form v-else class="flex flex-col gap-6" novalidate @submit.prevent="submit">
      <AdminPageHeader :title="title" :subtitle="subtitle" />

      <BaseFormAlert v-if="formError" :message="formError" />

      <div class="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
        <div class="flex flex-col gap-6">
          <PizzaBasicInfoCard
            v-model:name="form.name"
            v-model:description="form.description"
            v-model:price="form.price"
            :errors="errors"
            :disabled="isSaving"
            @blur="touch"
          />
          <PizzaIngredientsCard
            v-model:selected-ids="ingredientIds"
            v-model:new-ingredient-name="newIngredientName"
            :ingredients="ingredients"
            :loading="ingredientsQuery.isPending.value"
            :adding="createIngredient.isPending.value"
            :add-error="ingredientError"
            :disabled="isSaving"
            @add="addIngredient"
          />
        </div>
        <PizzaImageCard
          v-model:file="imageFile"
          :current-image-url="currentImageUrl"
          :disabled="isSaving"
        />
      </div>

      <div class="flex justify-end gap-3 border-t border-border pt-6">
        <BaseButton variant="secondary" label="Cancel" :disabled="isSaving" @click="cancel" />
        <BaseButton
          type="submit"
          :label="submitLabel"
          :loading="isSaving"
          :disabled="!canSubmit"
          data-test="submit-pizza"
        />
      </div>
    </form>
  </section>
</template>
