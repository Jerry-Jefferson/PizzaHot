import { useVuelidate } from "@vuelidate/core";
import { email, helpers, required } from "@vuelidate/validators";
import { isAxiosError } from "axios";
import { computed, type ComputedRef, reactive, type Ref, ref, toValue, watch } from "vue";

import { getErrorMessage, getFieldErrors } from "@/api/errors";
import type { SignInErrors, SignInField, SignInPayload } from "@/types/auth.types";

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";
export const TOO_MANY_ATTEMPTS_MESSAGE = "Too many attempts, try again in a minute";

const SIGN_IN_FIELDS: SignInField[] = ["email", "password"];

interface SignInForm {
  form: SignInPayload;
  errors: ComputedRef<SignInErrors>;
  formError: Ref<string | null>;
  touch: (field: SignInField) => void;
  validate: () => Promise<boolean>;
  toPayload: () => SignInPayload;
  applyServerError: (error: unknown) => void;
}

export function useSignInForm(): SignInForm {
  const form = reactive<SignInPayload>({ email: "", password: "" });
  const serverErrors = ref<SignInErrors>({});
  const formError = ref<string | null>(null);

  const rules = {
    email: {
      required: helpers.withMessage("Email is required", required),
      email: helpers.withMessage("Please enter a valid email", email),
    },
    password: {
      required: helpers.withMessage("Password is required", required),
    },
  };

  const v$ = useVuelidate(rules, form);

  const errors = computed<SignInErrors>(() =>
    Object.fromEntries(
      SIGN_IN_FIELDS.map((field) => {
        const clientError = v$.value[field].$errors[0]?.$message;
        return [field, clientError ? toValue(clientError) : serverErrors.value[field]];
      })
    )
  );

  for (const field of SIGN_IN_FIELDS) {
    watch(
      () => form[field],
      () => {
        serverErrors.value = { ...serverErrors.value, [field]: undefined };
      }
    );
  }

  function touch(field: SignInField): void {
    v$.value[field].$touch();
  }

  async function validate(): Promise<boolean> {
    formError.value = null;
    serverErrors.value = {};
    return v$.value.$validate();
  }

  function toPayload(): SignInPayload {
    return { email: form.email.trim(), password: form.password };
  }

  function applyServerError(error: unknown): void {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 401 || status === 403) {
      formError.value = INVALID_CREDENTIALS_MESSAGE;
      return;
    }
    if (status === 429) {
      formError.value = TOO_MANY_ATTEMPTS_MESSAGE;
      return;
    }

    const fieldErrors = getFieldErrors(error);
    const knownFieldErrors = Object.fromEntries(
      SIGN_IN_FIELDS.filter((field) => fieldErrors[field]).map((field) => [
        field,
        fieldErrors[field]?.[0],
      ])
    ) as SignInErrors;

    if (Object.keys(knownFieldErrors).length > 0) {
      serverErrors.value = knownFieldErrors;
      return;
    }
    formError.value = getErrorMessage(error);
  }

  return { form, errors, formError, touch, validate, toPayload, applyServerError };
}
