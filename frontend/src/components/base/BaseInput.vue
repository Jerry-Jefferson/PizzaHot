<script setup lang="ts">
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { computed, ref } from "vue";

interface BaseInputProps {
  id?: string;
  icon?: string;
  type?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  isPassword?: boolean;
}

defineOptions({ inheritAttrs: false });

const {
  id,
  icon,
  type = "text",
  placeholder,
  invalid,
  disabled,
  isPassword,
} = defineProps<BaseInputProps>();

const model = defineModel<string>({ default: "" });

const isVisible = ref(false);

const inputType = computed(() => {
  if (!isPassword) {
    return type;
  }
  return isVisible.value ? "text" : "password";
});

const leadingIcon = computed(() => icon ?? (isPassword ? "pi pi-lock" : undefined));

const inputClass = computed(() => [
  "h-10 w-full rounded-control border-input bg-card text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:bg-muted disabled:text-muted-foreground",
  { "border-primary focus:border-primary focus:ring-primary/25": invalid },
]);
</script>

<template>
  <IconField class="w-full">
    <InputIcon v-if="leadingIcon" :class="[leadingIcon, 'text-muted-foreground']" />
    <InputText
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :type="inputType"
      :placeholder="placeholder"
      :invalid="invalid"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :class="inputClass"
    />
    <InputIcon v-if="isPassword" class="flex items-center">
      <button
        type="button"
        class="cursor-pointer text-muted-foreground hover:text-foreground"
        :aria-label="isVisible ? 'Hide password' : 'Show password'"
        :aria-pressed="isVisible"
        :disabled="disabled"
        @click="isVisible = !isVisible"
      >
        <i :class="isVisible ? 'pi pi-eye-slash' : 'pi pi-eye'" aria-hidden="true" />
      </button>
    </InputIcon>
    <InputIcon v-else-if="$slots.trailing" class="flex items-center">
      <slot name="trailing" />
    </InputIcon>
  </IconField>
</template>
