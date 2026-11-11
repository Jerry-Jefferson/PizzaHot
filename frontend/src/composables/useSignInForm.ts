import { useVuelidate } from "@vuelidate/core";
import { email, helpers, required } from "@vuelidate/validators";
import { computed, type ComputedRef, reactive, type Ref, toValue } from "vue";

import type { SignInErrors, SignInField, SignInPayload } from "@/types/auth.types";

import { TOO_MANY_ATTEMPTS_MESSAGE, useServerFormErrors } from "./useServerFormErrors";

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

const SIGN_IN_FIELDS: readonly SignInField[] = ["email", "password"];

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
  const server = useServerFormErrors(SIGN_IN_FIELDS, form);

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
        return [field, clientError ? toValue(clientError) : server.fieldErrors.value[field]];
      })
    )
  );

  function touch(field: SignInField): void {
    v$.value[field].$touch();
  }

  async function validate(): Promise<boolean> {
    server.clear();
    return v$.value.$validate();
  }

  function toPayload(): SignInPayload {
    return { email: form.email.trim(), password: form.password };
  }

  function applyServerError(error: unknown): void {
    server.apply(error, {
      401: INVALID_CREDENTIALS_MESSAGE,
      403: INVALID_CREDENTIALS_MESSAGE,
      429: TOO_MANY_ATTEMPTS_MESSAGE,
    });
  }

  return {
    form,
    errors,
    formError: server.formError,
    touch,
    validate,
    toPayload,
    applyServerError,
  };
}
