<script setup lang="ts">
import Button from "primevue/button";
import { computed } from "vue";

import type { ComponentSize } from "@/types/ui.types";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger-outline";

interface BaseButtonProps {
  label?: string;
  icon?: string;
  variant?: ButtonVariant;
  size?: ComponentSize;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
}

const {
  label,
  icon,
  variant = "primary",
  size = "md",
  type = "button",
  loading,
  disabled,
  block,
} = defineProps<BaseButtonProps>();

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover",
  secondary:
    "border-secondary bg-secondary text-secondary-foreground hover:border-secondary-hover hover:bg-secondary-hover",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-muted",
  "danger-outline": "border-primary bg-transparent text-primary hover:bg-primary/10",
};

const SIZE_CLASSES: Record<ComponentSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const buttonClass = computed(() => [
  "rounded-control gap-2 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  VARIANT_CLASSES[variant],
  SIZE_CLASSES[size],
  { "w-full": block },
]);
</script>

<template>
  <Button
    :type="type"
    :label="label"
    :icon="icon"
    :loading="loading"
    :disabled="disabled || loading"
    :class="buttonClass"
  >
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </Button>
</template>
