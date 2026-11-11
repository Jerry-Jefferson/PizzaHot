import { type Ref, ref, type ShallowRef, shallowRef, watch } from "vue";

import { getErrorMessage, getErrorStatus, getFirstFieldErrors } from "@/api/errors";

export const TOO_MANY_ATTEMPTS_MESSAGE = "Too many attempts, try again in a minute";

type FieldMessages<TField extends string> = Partial<Record<TField, string>>;

function withMessage<TField extends string>(
  messages: FieldMessages<TField>,
  field: TField,
  message: string | undefined
): FieldMessages<TField> {
  const next: FieldMessages<TField> = { ...messages };
  next[field] = message;
  return next;
}

interface ServerFormErrors<TField extends string> {
  fieldErrors: ShallowRef<FieldMessages<TField>>;
  formError: Ref<string | null>;
  clear: () => void;
  setFieldError: (field: TField, message: string) => void;
  apply: (error: unknown, statusMessages?: Partial<Record<number, string>>) => void;
}

export function useServerFormErrors<TField extends string>(
  fields: readonly TField[],
  values: Record<TField, string>
): ServerFormErrors<TField> {
  const fieldErrors: ShallowRef<FieldMessages<TField>> = shallowRef({});
  const formError = ref<string | null>(null);

  for (const field of fields) {
    watch(
      () => values[field],
      () => {
        const current: FieldMessages<TField> = fieldErrors.value;
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
