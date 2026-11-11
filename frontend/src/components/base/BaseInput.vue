<script setup lang="ts">
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { computed } from "vue";

interface BaseInputProps {
  id?: string;
  icon?: string;
  type?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false });

const { id, icon, type = "text", placeholder, invalid, disabled } = defineProps<BaseInputProps>();

const model = defineModel<string>({ default: "" });

defineSlots<{ trailing?: () => unknown }>();

const inputClass = computed(() => [
  "h-10 w-full rounded-control border-input bg-card text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:bg-muted disabled:text-muted-foreground",
  { "border-primary focus:border-primary focus:ring-primary/25": invalid },
]);
</script>

<template>
  <IconField class="w-full">
    <InputIcon v-if="icon" :class="[icon, 'text-muted-foreground']" />
    <InputText
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :invalid="invalid"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :class="inputClass"
    />
    <InputIcon v-if="$slots.trailing" class="flex items-center">
      <slot name="trailing" />
    </InputIcon>
  </IconField>
</template>
