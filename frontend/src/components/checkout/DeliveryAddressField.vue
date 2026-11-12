<script setup lang="ts">
import BaseFormField from "@/components/base/BaseFormField.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import { ADDRESS_MAX } from "@/utils/constants/limits";

interface DeliveryAddressFieldProps {
  error?: string;
}

interface DeliveryAddressFieldEmits {
  blur: [];
}

const { error } = defineProps<DeliveryAddressFieldProps>();
const emit = defineEmits<DeliveryAddressFieldEmits>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <BaseFormField input-id="checkout-address" label="Delivery address" :error="error" required>
    <template #default="{ id, invalid, describedBy }">
      <BaseInput
        :id="id"
        v-model="model"
        icon="pi pi-map-marker"
        placeholder="Street, building, apartment"
        autocomplete="street-address"
        :maxlength="ADDRESS_MAX"
        :invalid="invalid"
        :aria-describedby="describedBy"
        @blur="emit('blur')"
      />
    </template>
  </BaseFormField>
</template>
