import { useVuelidate } from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import {
  computed,
  type ComputedRef,
  type MaybeRefOrGetter,
  reactive,
  type Ref,
  toValue,
  watch,
} from "vue";

import type {
  PersonalInfoErrors,
  PersonalInfoField,
  PersonalInfoFormValues,
  UpdateMePayload,
  User,
} from "@/types/user.types";
import { NAME_MAX } from "@/utils/constants/limits";

import { useServerFormErrors } from "./useServerFormErrors";

const PERSONAL_INFO_FIELDS: readonly PersonalInfoField[] = ["name", "surname", "gender"];

interface PersonalInfoForm {
  form: PersonalInfoFormValues;
  errors: ComputedRef<PersonalInfoErrors>;
  formError: Ref<string | null>;
  touch: (field: PersonalInfoField) => void;
  validate: () => Promise<boolean>;
  toPayload: () => UpdateMePayload;
  applyServerError: (error: unknown) => void;
}

const fitsNameLength = (value: string): boolean => value.trim().length <= NAME_MAX;
const toNullable = (value: string): string | null => value.trim() || null;

export function usePersonalInfoForm(user: MaybeRefOrGetter<User | null>): PersonalInfoForm {
  const form = reactive<PersonalInfoFormValues>({ name: "", surname: "", gender: "" });
  const server = useServerFormErrors(PERSONAL_INFO_FIELDS, form);

  const rules = {
    name: {
      maxLength: helpers.withMessage(
        `First name must be at most ${String(NAME_MAX)} characters`,
        fitsNameLength
      ),
    },
    surname: {
      maxLength: helpers.withMessage(
        `Last name must be at most ${String(NAME_MAX)} characters`,
        fitsNameLength
      ),
    },
    gender: {},
  };

  const v$ = useVuelidate(rules, form);

  watch(
    () => toValue(user),
    (current) => {
      form.name = current?.name ?? "";
      form.surname = current?.surname ?? "";
      form.gender = current?.gender ?? "";
      v$.value.$reset();
    },
    { immediate: true }
  );

  const errors = computed<PersonalInfoErrors>(() =>
    Object.fromEntries(
      PERSONAL_INFO_FIELDS.map((field) => {
        const clientError = v$.value[field].$errors[0]?.$message;
        return [field, clientError ? toValue(clientError) : server.fieldErrors.value[field]];
      })
    )
  );

  function touch(field: PersonalInfoField): void {
    v$.value[field].$touch();
  }

  async function validate(): Promise<boolean> {
    server.clear();
    return v$.value.$validate();
  }

  function toPayload(): UpdateMePayload {
    return {
      name: toNullable(form.name),
      surname: toNullable(form.surname),
      gender: form.gender || null,
    };
  }

  return {
    form,
    errors,
    formError: server.formError,
    touch,
    validate,
    toPayload,
    applyServerError: (error) => {
      server.apply(error);
    },
  };
}
