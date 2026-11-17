import { email, helpers, required } from "@vuelidate/validators";
import { type ComputedRef, reactive, type Ref } from "vue";

import type { SignInErrors, SignInField, SignInPayload } from "@/types/auth.types";
import { TOO_MANY_ATTEMPTS_MESSAGE } from "@/utils/constants/auth.constants";

import { useValidatedForm } from "./useValidatedForm";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

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

  const rules = {
    email: {
      required: helpers.withMessage("Email is required", required),
      email: helpers.withMessage("Please enter a valid email", email),
    },
    password: {
      required: helpers.withMessage("Password is required", required),
    },
  };

  const { server, errors, touch, validate, formError } = useValidatedForm(
    SIGN_IN_FIELDS,
    form,
    rules
  );

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
    formError,
    touch,
    validate,
    toPayload,
    applyServerError,
  };
}
