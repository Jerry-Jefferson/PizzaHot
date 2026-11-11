<script setup lang="ts" generic="TValue extends string | number">
import Select from "primevue/select";

interface SelectOption {
  label: string;
  value: TValue;
}

interface BaseSelectProps {
  options: SelectOption[];
  id?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  showClear?: boolean;
}

defineOptions({ inheritAttrs: false });

const { options, id, placeholder, invalid, disabled, showClear } = defineProps<BaseSelectProps>();

const model = defineModel<TValue | null>({ default: null });
</script>

<template>
  <Select
    v-bind="$attrs"
    v-model="model"
    :input-id="id"
    :options="options"
    option-label="label"
    option-value="value"
    :placeholder="placeholder"
    :invalid="invalid"
    :disabled="disabled"
    :show-clear="showClear"
    :class="[
      'h-10 w-full items-center rounded-control border-input bg-card text-foreground',
      invalid ? 'border-primary' : 'focus-within:border-ring',
      { 'bg-muted text-muted-foreground': disabled },
    ]"
  />
</template>
