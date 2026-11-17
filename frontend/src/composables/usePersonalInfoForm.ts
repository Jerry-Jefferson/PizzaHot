import { helpers } from "@vuelidate/validators";
import { type ComputedRef, type MaybeRefOrGetter, reactive, type Ref, toValue, watch } from "vue";

import type {
  PersonalInfoErrors,
  PersonalInfoField,
  PersonalInfoFormValues,
  UpdateMePayload,
  User,
} from "@/types/user.types";
import { NAME_MAX } from "@/utils/constants/limits.constants";

import { useValidatedForm } from "./useValidatedForm";

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

  const { v$, server, errors, touch, validate, formError } = useValidatedForm(
    PERSONAL_INFO_FIELDS,
    form,
    rules
  );

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
    formError,
    touch,
    validate,
    toPayload,
    applyServerError: (error) => {
      server.apply(error);
    },
  };
}
