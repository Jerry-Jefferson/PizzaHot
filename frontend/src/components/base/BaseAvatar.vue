<script setup lang="ts">
import { computed, ref, watch } from "vue";

import type { ComponentSize } from "@/types/ui.types";
import { getInitials } from "@/utils/initials";

interface BaseAvatarProps {
  name?: string | null;
  surname?: string | null;
  email?: string | null;
  src?: string | null;
  size?: ComponentSize;
}

const {
  name = null,
  surname = null,
  email = null,
  src = null,
  size = "md",
} = defineProps<BaseAvatarProps>();

const SIZE_CLASSES: Record<ComponentSize, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
};

const imageFailed = ref(false);
watch(
  () => src,
  () => {
    imageFailed.value = false;
  }
);

const initials = computed(() => getInitials({ name, surname, email }));
const altText = computed(() => {
  const fullName = [name, surname].filter(Boolean).join(" ");
  return fullName.length > 0 ? fullName : (email ?? "User");
});
</script>

<template>
  <span
    :class="[
      'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary',
      SIZE_CLASSES[size],
    ]"
  >
    <img
      v-if="src && !imageFailed"
      :src="src"
      :alt="altText"
      class="size-full object-cover"
      @error="imageFailed = true"
    />
    <span v-else :aria-label="altText" role="img">{{ initials }}</span>
  </span>
</template>
