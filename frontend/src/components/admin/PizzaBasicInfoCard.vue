<script setup lang="ts">
import InputNumber from "primevue/inputnumber";

import BaseCard from "@/components/base/BaseCard.vue";
import BaseFormField from "@/components/base/BaseFormField.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseTextarea from "@/components/base/BaseTextarea.vue";
import type { PizzaField, PizzaFormErrors } from "@/types/pizza.types";

interface PizzaBasicInfoCardProps {
  errors?: PizzaFormErrors;
  disabled?: boolean;
}

interface PizzaBasicInfoCardEmits {
  blur: [field: PizzaField];
}

const { errors = {}, disabled } = defineProps<PizzaBasicInfoCardProps>();
const emit = defineEmits<PizzaBasicInfoCardEmits>();

const name = defineModel<string>("name", { required: true });
const description = defineModel<string>("description", { required: true });
const price = defineModel<number | null>("price", { required: true });
</script>

<template>
  <BaseCard>
    <template #header>
      <h2 class="text-section-title">Basic information</h2>
    </template>

    <BaseFormField
      v-slot="{ id, invalid, describedBy }"
      input-id="pizza-name"
      label="Name"
      required
      :error="errors.name"
    >
      <BaseInput
        :id="id"
        v-model="name"
        placeholder="e.g. Margherita"
        :invalid="invalid"
        :disabled="disabled"
        :aria-describedby="describedBy"
        @blur="emit('blur', 'name')"
      />
    </BaseFormField>

    <BaseFormField
      v-slot="{ id, invalid, describedBy }"
      input-id="pizza-description"
      label="Description"
      required
      :error="errors.description"
    >
      <BaseTextarea
        :id="id"
        v-model="description"
        :rows="4"
        placeholder="What makes this pizza special?"
        :invalid="invalid"
        :disabled="disabled"
        :aria-describedby="describedBy"
        @blur="emit('blur', 'description')"
      />
    </BaseFormField>

    <BaseFormField
      v-slot="{ id, invalid, describedBy }"
      input-id="pizza-price"
      label="Price"
      required
      :error="errors.price"
    >
      <InputNumber
        v-model="price"
        :input-id="id"
        mode="currency"
        currency="USD"
        locale="en-US"
        :min="0.01"
        :min-fraction-digits="2"
        :max-fraction-digits="2"
        placeholder="$0.00"
        :invalid="invalid"
        :disabled="disabled"
        :aria-describedby="describedBy"
        fluid
        @blur="emit('blur', 'price')"
      />
    </BaseFormField>
  </BaseCard>
</template>
