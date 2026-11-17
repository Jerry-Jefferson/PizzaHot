import type { ValidationArgs } from "@vuelidate/core";
import { helpers, maxLength, minLength, required, sameAs } from "@vuelidate/validators";
import { type ComputedRef, reactive, type Ref, toRef } from "vue";

import { getErrorStatus } from "@/services/errors";
import type {
  ChangePasswordErrors,
  ChangePasswordField,
  ChangePasswordFormValues,
  ChangePasswordPayload,
} from "@/types/user.types";

import { useValidatedForm } from "./useValidatedForm";

const PASSWORD_CHANGE_MIN = 8;
const PASSWORD_CHANGE_MAX = 128;
const INCORRECT_CURRENT_PASSWORD_MESSAGE = "Current password is incorrect";

const CHANGE_PASSWORD_FIELDS: readonly ChangePasswordField[] = [
  "currentPassword",
  "newPassword",
  "confirmPassword",
];

interface ChangePasswordForm {
  form: ChangePasswordFormValues;
  errors: ComputedRef<ChangePasswordErrors>;
  formError: Ref<string | null>;
  touch: (field: ChangePasswordField) => void;
  validate: () => Promise<boolean>;
  toPayload: () => ChangePasswordPayload;
  applyServerError: (error: unknown) => void;
  reset: () => void;
}

function lengthRules(label: string): ValidationArgs {
  return {
    required: helpers.withMessage(`${label} is required`, required),
    minLength: helpers.withMessage(
      `${label} must be at least ${String(PASSWORD_CHANGE_MIN)} characters`,
      minLength(PASSWORD_CHANGE_MIN)
    ),
    maxLength: helpers.withMessage(
      `${label} must be at most ${String(PASSWORD_CHANGE_MAX)} characters`,
      maxLength(PASSWORD_CHANGE_MAX)
    ),
  };
}

export function useChangePasswordForm(): ChangePasswordForm {
  const form = reactive<ChangePasswordFormValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const rules = {
    currentPassword: lengthRules("Current password"),
    newPassword: {
      ...lengthRules("New password"),
      differsFromCurrent: helpers.withMessage(
        "New password must be different from the current password",
        (value: string) => value === "" || value !== form.currentPassword
      ),
    },
    confirmPassword: {
      required: helpers.withMessage("Please confirm your new password", required),
      sameAsNewPassword: helpers.withMessage(
        "Passwords do not match",
        sameAs(toRef(form, "newPassword"))
      ),
    },
  };

  const { v$, server, errors, touch, validate, formError } = useValidatedForm(
    CHANGE_PASSWORD_FIELDS,
    form,
    rules
  );

  function toPayload(): ChangePasswordPayload {
    return { currentPassword: form.currentPassword, newPassword: form.newPassword };
  }

  function applyServerError(error: unknown): void {
    if (getErrorStatus(error) === 401) {
      server.setFieldError("currentPassword", INCORRECT_CURRENT_PASSWORD_MESSAGE);
      return;
    }
    server.apply(error);
  }

  function reset(): void {
    form.currentPassword = "";
    form.newPassword = "";
    form.confirmPassword = "";
    v$.value.$reset();
    server.clear();
  }

  return {
    form,
    errors,
    formError,
    touch,
    validate,
    toPayload,
    applyServerError,
    reset,
  };
}
