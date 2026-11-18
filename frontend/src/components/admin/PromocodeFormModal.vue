<script setup lang="ts">
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import ToggleSwitch from "primevue/toggleswitch";
import { computed } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseFormAlert from "@/components/base/BaseFormAlert.vue";
import BaseFormField from "@/components/base/BaseFormField.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import {
  DiscountMode,
  type PromocodeField,
  type PromocodeFormErrors,
  type PromocodeFormMode,
} from "@/types/promocode.types";
import {
  DISCOUNT_MODE_LABELS,
  DISCOUNT_MODES,
  MAX_PERCENTAGE_DISCOUNT,
  PROMOCODE_CODE_MAX_LENGTH,
} from "@/utils/constants/promocode.constants";
import { startOfTomorrow } from "@/utils/promocode";

interface PromocodeFormModalProps {
  mode: PromocodeFormMode;
  errors?: PromocodeFormErrors;
  formError?: string | null;
  saving?: boolean;
}

interface PromocodeFormModalEmits {
  submit: [];
  blur: [field: PromocodeField];
}

const { mode, errors = {}, formError = null, saving } = defineProps<PromocodeFormModalProps>();
const emit = defineEmits<PromocodeFormModalEmits>();

const visible = defineModel<boolean>("visible", { required: true });
const code = defineModel<string>("code", { required: true });
const discount = defineModel<number | null>("discount", { required: true });
const discountMode = defineModel<DiscountMode>("discountMode", { required: true });
const validTill = defineModel<Date | null>("validTill", { required: true });
const isActive = defineModel<boolean>("isActive", { default: true });

const DISCOUNT_MODE_OPTIONS = DISCOUNT_MODES.map((value) => ({
  label: DISCOUNT_MODE_LABELS[value],
  value,
}));

const isEditing = computed(() => mode === "edit");
const isPercentage = computed(() => discountMode.value === DiscountMode.PERCENTAGE);
const minDate = computed(() => (isEditing.value ? undefined : startOfTomorrow()));

function updateCode(value: string): void {
  code.value = value.toUpperCase();
}

function updateValidTill(value: Date | Date[] | (Date | null)[] | null | undefined): void {
  validTill.value = value instanceof Date ? value : null;
}
</script>

<template>
  <BaseModal
    v-model:visible="visible"
    :header="isEditing ? 'Edit Promo Code' : 'New Promo Code'"
    width-class="max-w-md"
    :persistent="saving"
  >
    <form
      class="flex flex-col gap-4"
      novalidate
      data-test="promocode-form"
      @submit.prevent="emit('submit')"
    >
      <BaseFormAlert v-if="formError" :message="formError" />

      <BaseFormField
        v-slot="{ id, invalid, describedBy }"
        input-id="promocode-code"
        label="Code"
        required
        :error="errors.code"
      >
        <BaseInput
          :id="id"
          :model-value="code"
          icon="pi pi-tag"
          placeholder="e.g. WELCOME20"
          :maxlength="PROMOCODE_CODE_MAX_LENGTH"
          :invalid="invalid"
          :disabled="saving"
          :aria-describedby="describedBy"
          class="font-mono uppercase"
          @update:model-value="updateCode"
          @blur="emit('blur', 'code')"
        />
      </BaseFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <BaseFormField
          v-slot="{ id, invalid, describedBy }"
          input-id="promocode-discount"
          label="Discount value"
          required
          :error="errors.discount"
        >
          <InputNumber
            v-model="discount"
            :input-id="id"
            :min="1"
            :max="isPercentage ? MAX_PERCENTAGE_DISCOUNT : undefined"
            :max-fraction-digits="0"
            :use-grouping="false"
            :suffix="isPercentage ? '%' : undefined"
            :prefix="isPercentage ? undefined : '$'"
            :placeholder="isPercentage ? '20%' : '$10'"
            :invalid="invalid"
            :disabled="saving"
            :aria-describedby="describedBy"
            fluid
            @blur="emit('blur', 'discount')"
          />
        </BaseFormField>

        <BaseFormField input-id="promocode-discount-mode" label="Discount type">
          <BaseSelect
            id="promocode-discount-mode"
            :model-value="discountMode"
            :options="DISCOUNT_MODE_OPTIONS"
            :disabled="saving"
            @update:model-value="discountMode = $event ?? discountMode"
          />
        </BaseFormField>
      </div>

      <BaseFormField
        v-slot="{ id, invalid, describedBy }"
        input-id="promocode-valid-till"
        label="Expires on"
        required
        :error="errors.validTill"
      >
        <DatePicker
          :model-value="validTill"
          :input-id="id"
          show-icon
          icon-display="input"
          date-format="M d, yy"
          placeholder="Pick a date"
          :min-date="minDate"
          :invalid="invalid"
          :disabled="saving"
          :aria-describedby="describedBy"
          fluid
          @update:model-value="updateValidTill"
          @blur="emit('blur', 'validTill')"
        />
      </BaseFormField>

      <div
        v-if="isEditing"
        class="flex items-center justify-between gap-4 rounded-xl bg-card-subtle px-4 py-3"
        data-test="promocode-active"
      >
        <label for="promocode-active" class="flex flex-col">
          <span class="text-label">Active</span>
          <span class="text-caption">Inactive codes can't be applied to a cart.</span>
        </label>
        <ToggleSwitch v-model="isActive" input-id="promocode-active" :disabled="saving" />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <BaseButton
          variant="secondary"
          label="Cancel"
          :disabled="saving"
          @click="visible = false"
        />
        <BaseButton
          type="submit"
          :label="isEditing ? 'Save changes' : 'Create code'"
          :loading="saving"
          data-test="promocode-submit"
        />
      </div>
    </form>
  </BaseModal>
</template>
