<script setup lang="ts">
import Textarea from "primevue/textarea";
import { computed } from "vue";

interface BaseTextareaProps {
  id?: string;
  placeholder?: string;
  maxlength?: number;
  rows?: number;
  invalid?: boolean;
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false });

const {
  id,
  placeholder,
  maxlength,
  rows = 3,
  invalid,
  disabled,
} = defineProps<BaseTextareaProps>();

const model = defineModel<string>({ default: "" });

const textareaClass = computed(() => [
  "w-full rounded-control border-input bg-card text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:bg-muted disabled:text-muted-foreground",
  { "border-primary focus:border-primary focus:ring-primary/25": invalid },
]);
</script>

<template>
  <div class="flex flex-col gap-1">
    <Textarea
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :rows="rows"
      :invalid="invalid"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      auto-resize
      :class="textareaClass"
    />
    <span v-if="maxlength" class="self-end text-caption" aria-live="polite">
      {{ model.length }}/{{ maxlength }}
    </span>
  </div>
</template>
