import { useVuelidate } from "@vuelidate/core";
import { email, helpers, required, sameAs } from "@vuelidate/validators";
import { computed, type ComputedRef, reactive, type Ref, toRef, toValue } from "vue";

import { getErrorStatus } from "@/api/errors";
import type {
  SignUpErrors,
  SignUpField,
  SignUpFormValues,
  SignUpPayload,
} from "@/types/auth.types";
import { NAME_MAX } from "@/utils/constants/limits";
import { PASSWORD_RULES } from "@/utils/password-rules";

import { TOO_MANY_ATTEMPTS_MESSAGE, useServerFormErrors } from "./useServerFormErrors";

export const EMAIL_TAKEN_MESSAGE = "An account with this email already exists";

export const SIGN_UP_FIELDS: readonly SignUpField[] = [
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

const passwordRuleValidators = Object.fromEntries(
  PASSWORD_RULES.map((rule) => [
    rule.id,
    helpers.withMessage(rule.message, (value: string) => value === "" || rule.test(value)),
  ])
);

export function useSignUpForm(): SignUpForm {
  const form = reactive<SignUpFormValues>({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const server = useServerFormErrors(SIGN_UP_FIELDS, form);

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
      ...passwordRuleValidators,
    },
    confirmPassword: {
      required: helpers.withMessage("Please confirm your password", required),
      sameAsPassword: helpers.withMessage(
        "Passwords do not match",
        sameAs(toRef(form, "password"))
      ),
    },
  };

  const v$ = useVuelidate(rules, form);

  const errors = computed<SignUpErrors>(() =>
    Object.fromEntries(
      SIGN_UP_FIELDS.map((field) => {
        const clientError = v$.value[field].$errors[0]?.$message;
        return [field, clientError ? toValue(clientError) : server.fieldErrors.value[field]];
      })
    )
  );

  const firstInvalidField = computed(() => SIGN_UP_FIELDS.find((field) => errors.value[field]));

  function touch(field: SignUpField): void {
    v$.value[field].$touch();
  }

  async function validate(): Promise<boolean> {
    server.clear();
    return v$.value.$validate();
  }

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
    formError: server.formError,
    firstInvalidField,
    touch,
    validate,
    toPayload,
    applyServerError,
  };
}
