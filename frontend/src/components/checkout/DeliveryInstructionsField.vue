<script setup lang="ts">
import { computed } from "vue";

import BaseFormField from "@/components/base/BaseFormField.vue";
import BaseTextarea from "@/components/base/BaseTextarea.vue";
import { DeliveryType } from "@/types/order.types";
import { ORDER_COMMENT_MAX } from "@/utils/constants/limits";

interface DeliveryInstructionsFieldProps {
  delivery: DeliveryType;
  error?: string;
}

interface DeliveryInstructionsFieldEmits {
  blur: [];
}

const { delivery, error } = defineProps<DeliveryInstructionsFieldProps>();
const emit = defineEmits<DeliveryInstructionsFieldEmits>();

const model = defineModel<string>({ required: true });

const label = computed(() =>
  delivery === DeliveryType.DELIVERY
    ? "Delivery instructions (optional)"
    : "Notes for pickup (optional)"
);
const placeholder = computed(() =>
  delivery === DeliveryType.DELIVERY
    ? "Gate code, floor, leave at the door…"
    : "Anything we should know?"
);
</script>

<template>
  <BaseFormField input-id="checkout-comment" :label="label" :error="error">
    <template #default="{ id, invalid, describedBy }">
      <BaseTextarea
        :id="id"
        v-model="model"
        :placeholder="placeholder"
        :maxlength="ORDER_COMMENT_MAX"
        :invalid="invalid"
        :aria-describedby="describedBy"
        @blur="emit('blur')"
      />
    </template>
  </BaseFormField>
</template>
