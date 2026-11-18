import { email, helpers, required, sameAs } from "@vuelidate/validators";
import { type ComputedRef, reactive, type Ref, toRef } from "vue";

import { getErrorStatus } from "@/services/errors";
import type {
  SignUpErrors,
  SignUpField,
  SignUpFormValues,
  SignUpPayload,
} from "@/types/auth.types";
import { TOO_MANY_ATTEMPTS_MESSAGE } from "@/utils/constants/auth.constants";
import { NAME_MAX } from "@/utils/constants/limits.constants";
import { passwordRuleValidators } from "@/utils/password-rules";

import { useValidatedForm } from "./useValidatedForm";

export const EMAIL_TAKEN_MESSAGE = "An account with this email already exists";

const SIGN_UP_FIELDS: readonly SignUpField[] = [
  "name",
  "surname",
  "email",
  "password",
  "confirmPassword",
];

interface SignUpForm {
  form: SignUpFormValues;
  errors: ComputedRef<SignUpErrors>;
  formError: Ref<string | null>;
  firstInvalidField: ComputedRef<SignUpField | undefined>;
  touch: (field: SignUpField) => void;
  validate: () => Promise<boolean>;
  toPayload: () => SignUpPayload;
  applyServerError: (error: unknown) => void;
}

const fitsNameLength = (value: string): boolean => value.trim().length <= NAME_MAX;

export function useSignUpForm(): SignUpForm {
  const form = reactive<SignUpFormValues>({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const rules = {
    name: {
      required: helpers.withMessage("First name is required", required),
      maxLength: helpers.withMessage(
        `First name must be at most ${String(NAME_MAX)} characters`,
        fitsNameLength
      ),
    },
    surname: {
      required: helpers.withMessage("Last name is required", required),
      maxLength: helpers.withMessage(
        `Last name must be at most ${String(NAME_MAX)} characters`,
        fitsNameLength
      ),
    },
    email: {
      required: helpers.withMessage("Email is required", required),
      email: helpers.withMessage("Please enter a valid email", email),
    },
    password: {
      required: helpers.withMessage("Password is required", required),
      ...passwordRuleValidators(),
    },
    confirmPassword: {
      required: helpers.withMessage("Please confirm your password", required),
      sameAsPassword: helpers.withMessage(
        "Passwords do not match",
        sameAs(toRef(form, "password"))
      ),
    },
  };

  const { server, errors, touch, validate, firstInvalidField, formError } = useValidatedForm(
    SIGN_UP_FIELDS,
    form,
    rules
  );

  function toPayload(): SignUpPayload {
    return {
      name: form.name.trim(),
      surname: form.surname.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    };
  }

  function applyServerError(error: unknown): void {
    if (getErrorStatus(error) === 409) {
      server.setFieldError("email", EMAIL_TAKEN_MESSAGE);
      return;
    }
    server.apply(error, { 429: TOO_MANY_ATTEMPTS_MESSAGE });
  }

  return {
    form,
    errors,
    formError,
    firstInvalidField,
    touch,
    validate,
    toPayload,
    applyServerError,
  };
}
