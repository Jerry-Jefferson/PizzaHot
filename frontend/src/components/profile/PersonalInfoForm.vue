<script setup lang="ts">
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import BaseFormAlert from "@/components/base/BaseFormAlert.vue";
import BaseFormField from "@/components/base/BaseFormField.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import { Gender, type PersonalInfoErrors, type PersonalInfoField } from "@/types/user.types";

interface PersonalInfoFormProps {
  email: string;
  errors?: PersonalInfoErrors;
  formError?: string | null;
  loading?: boolean;
}

interface PersonalInfoFormEmits {
  submit: [];
  blur: [field: PersonalInfoField];
}

const { email, errors = {}, formError = null, loading } = defineProps<PersonalInfoFormProps>();
const emit = defineEmits<PersonalInfoFormEmits>();

const name = defineModel<string>("name", { required: true });
const surname = defineModel<string>("surname", { required: true });
const gender = defineModel<Gender | "">("gender", { required: true });

const GENDER_OPTIONS: { label: string; value: Gender | "" }[] = [
  { label: "Not specified", value: "" },
  { label: "Male", value: Gender.MALE },
  { label: "Female", value: Gender.FEMALE },
];
</script>

<template>
  <BaseCard>
    <template #header>
      <h2 class="text-section-title">Personal information</h2>
    </template>

    <form class="flex flex-col gap-5" novalidate @submit.prevent="emit('submit')">
      <BaseFormAlert v-if="formError" :message="formError" />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseFormField
          v-slot="{ id, invalid, describedBy }"
          input-id="profile-name"
          label="First name"
          :error="errors.name"
        >
          <BaseInput
            :id="id"
            v-model="name"
            icon="pi pi-user"
            autocomplete="given-name"
            :invalid="invalid"
            :aria-describedby="describedBy"
            @blur="emit('blur', 'name')"
          />
        </BaseFormField>

        <BaseFormField
          v-slot="{ id, invalid, describedBy }"
          input-id="profile-surname"
          label="Last name"
          :error="errors.surname"
        >
          <BaseInput
            :id="id"
            v-model="surname"
            autocomplete="family-name"
            :invalid="invalid"
            :aria-describedby="describedBy"
            @blur="emit('blur', 'surname')"
          />
        </BaseFormField>
      </div>

      <BaseFormField
        v-slot="{ id, invalid }"
        input-id="profile-gender"
        label="Gender"
        :error="errors.gender"
      >
        <BaseSelect :id="id" v-model="gender" :options="GENDER_OPTIONS" :invalid="invalid" />
      </BaseFormField>

      <BaseFormField
        v-slot="{ id, describedBy }"
        input-id="profile-email"
        label="Email"
        hint="Email cannot be changed"
      >
        <BaseInput
          :id="id"
          :model-value="email"
          type="email"
          icon="pi pi-envelope"
          disabled
          readonly
          :aria-describedby="describedBy"
        />
      </BaseFormField>

      <div class="flex justify-end">
        <BaseButton type="submit" label="Save changes" :loading="loading" />
      </div>
    </form>
  </BaseCard>
</template>
