<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import { ALLOWED_IMAGE_TYPES } from "@/utils/constants/limits.constants";
import { getImageFileError } from "@/utils/media";

interface PizzaImageCardProps {
  currentImageUrl?: string | null;
  disabled?: boolean;
}

const { currentImageUrl = null, disabled } = defineProps<PizzaImageCardProps>();

const file = defineModel<File | null>("file", { required: true });

const fileInput = useTemplateRef<HTMLInputElement>("fileInput");
const error = ref<string | null>(null);
const isDragging = ref(false);
const previewUrl = ref<string | null>(null);

const shownImageUrl = computed(() => previewUrl.value ?? currentImageUrl);

function releasePreview(): void {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
}

watch(
  file,
  (selected) => {
    releasePreview();
    if (selected) {
      previewUrl.value = URL.createObjectURL(selected);
    }
  },
  { immediate: true }
);

onBeforeUnmount(releasePreview);

function pick(selected: File | undefined): void {
  if (!selected || disabled) {
    return;
  }
  error.value = getImageFileError(selected);
  if (error.value === null) {
    file.value = selected;
  }
}

function openPicker(): void {
  fileInput.value?.click();
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  pick(input.files?.[0]);
  input.value = "";
}

function onDrop(event: DragEvent): void {
  isDragging.value = false;
  pick(event.dataTransfer?.files[0]);
}

function removeSelection(): void {
  file.value = null;
  error.value = null;
}
</script>

<template>
  <BaseCard>
    <template #header>
      <h2 class="text-section-title">Pizza image</h2>
    </template>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="ALLOWED_IMAGE_TYPES.join(',')"
      data-test="image-input"
      @change="onFileChange"
    />

    <div v-if="shownImageUrl" class="flex flex-col gap-3" @dragover.prevent @drop.prevent="onDrop">
      <img
        :src="shownImageUrl"
        alt="Pizza image preview"
        class="aspect-[4/3] w-full rounded-xl bg-card-subtle object-cover"
        data-test="image-preview"
      />
      <div class="flex items-center justify-between gap-3">
        <span v-if="file" class="truncate text-caption">{{ file.name }}</span>
        <button
          v-if="file"
          type="button"
          class="cursor-pointer text-sm font-medium text-primary hover:underline"
          :disabled="disabled"
          data-test="remove-image"
          @click="removeSelection"
        >
          Remove
        </button>
        <BaseButton
          v-else
          variant="secondary"
          icon="pi pi-upload"
          label="Replace image"
          :disabled="disabled"
          @click="openPicker"
        />
      </div>
    </div>

    <div
      v-else
      :class="[
        'flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card-subtle',
      ]"
      data-test="drop-zone"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <i class="pi pi-cloud-upload text-3xl text-muted-foreground" aria-hidden="true" />
      <p class="text-sm text-foreground">
        Drag an image here or
        <button
          type="button"
          class="cursor-pointer font-medium text-primary hover:underline"
          :disabled="disabled"
          @click="openPicker"
        >
          browse
        </button>
      </p>
      <p class="text-caption">JPG, PNG or WebP · up to 5 MB</p>
    </div>

    <p v-if="error" class="text-sm text-primary" role="alert" data-test="image-error">
      {{ error }}
    </p>
  </BaseCard>
</template>
