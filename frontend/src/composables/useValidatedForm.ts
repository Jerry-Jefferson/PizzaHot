import { type BaseValidation, useVuelidate, type ValidationArgs } from "@vuelidate/core";
import { computed, type ComputedRef, type Ref, toValue } from "vue";

import type { FormErrors } from "@/types/form.types";

import { type ServerFormErrors, useServerFormErrors } from "./useServerFormErrors";

type Vuelidate = ReturnType<typeof useVuelidate>;

interface ValidatedForm<TField extends string> {
  v$: Vuelidate;
  server: ServerFormErrors<TField>;
  errors: ComputedRef<FormErrors<TField>>;
  formError: Ref<string | null>;
  firstInvalidField: ComputedRef<TField | undefined>;
  touch: (field: TField) => void;
  validate: () => Promise<boolean>;
}

export function useValidatedForm<TField extends string>(
  fields: readonly TField[],
  form: Record<TField, string>,
  rules: ValidationArgs
): ValidatedForm<TField> {
  const server = useServerFormErrors(fields, form);
  const v$ = useVuelidate(rules, form);

  const errors = computed(() => {
    const result: FormErrors<TField> = {};
    for (const field of fields) {
      const clientError = v$.value.$errors.find((error) => error.$property === field)?.$message;
      const message = clientError ? toValue(clientError) : server.fieldErrors.value[field];
      if (message) {
        result[field] = message;
      }
    }
    return result;
  });

  const firstInvalidField = computed(() => fields.find((field) => errors.value[field]));

  function touch(field: TField): void {
    const fieldValidation = v$.value[field] as BaseValidation | undefined;
    fieldValidation?.$touch();
  }

  async function validate(): Promise<boolean> {
    server.clear();
    return v$.value.$validate();
  }

  return { v$, server, errors, formError: server.formError, firstInvalidField, touch, validate };
}
