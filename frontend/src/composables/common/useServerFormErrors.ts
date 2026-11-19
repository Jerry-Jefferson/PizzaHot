import { type Ref, ref, type ShallowRef, shallowRef, watch } from "vue";

import type { FormErrors } from "@/types/form.types";
import { getErrorMessage, getErrorStatus, getFirstFieldErrors } from "@/utils/errors";

function withMessage<TField extends string>(
  messages: FormErrors<TField>,
  field: TField,
  message: string | undefined
): FormErrors<TField> {
  const next: FormErrors<TField> = { ...messages };
  next[field] = message;
  return next;
}

export interface ServerFormErrors<TField extends string> {
  fieldErrors: ShallowRef<FormErrors<TField>>;
  formError: Ref<string | null>;
  clear: () => void;
  setFieldError: (field: TField, message: string) => void;
  apply: (error: unknown, statusMessages?: Partial<Record<number, string>>) => void;
}

export function useServerFormErrors<TField extends string>(
  fields: readonly TField[],
  values: Record<TField, unknown>
): ServerFormErrors<TField> {
  const fieldErrors: ShallowRef<FormErrors<TField>> = shallowRef({});
  const formError = ref<string | null>(null);

  for (const field of fields) {
    watch(
      () => values[field],
      () => {
        const current: FormErrors<TField> = fieldErrors.value;
        if (current[field]) {
          fieldErrors.value = withMessage(current, field, undefined);
        }
      }
    );
  }

  function clear(): void {
    fieldErrors.value = {};
    formError.value = null;
  }

  function setFieldError(field: TField, message: string): void {
    fieldErrors.value = withMessage(fieldErrors.value, field, message);
  }

  function apply(error: unknown, statusMessages: Partial<Record<number, string>> = {}): void {
    const status = getErrorStatus(error);
    const statusMessage = status === undefined ? undefined : statusMessages[status];
    if (statusMessage) {
      formError.value = statusMessage;
      return;
    }

    const knownFieldErrors = getFirstFieldErrors(error, fields);
    if (Object.keys(knownFieldErrors).length > 0) {
      fieldErrors.value = knownFieldErrors;
      return;
    }
    formError.value = getErrorMessage(error);
  }

  return { fieldErrors, formError, clear, setFieldError, apply };
}
