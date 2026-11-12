import { useVuelidate, type ValidationArgs } from "@vuelidate/core";
import { helpers, maxLength, minLength, required, sameAs } from "@vuelidate/validators";
import { computed, type ComputedRef, reactive, type Ref, toRef, toValue } from "vue";

import { getErrorStatus } from "@/api/errors";
import type {
  ChangePasswordErrors,
  ChangePasswordField,
  ChangePasswordFormValues,
  ChangePasswordPayload,
} from "@/types/user.types";

import { useServerFormErrors } from "./useServerFormErrors";

export const PASSWORD_CHANGE_MIN = 8;
export const PASSWORD_CHANGE_MAX = 128;
export const INCORRECT_CURRENT_PASSWORD_MESSAGE = "Current password is incorrect";

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
  const server = useServerFormErrors(CHANGE_PASSWORD_FIELDS, form);

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

  const v$ = useVuelidate(rules, form);

  const errors = computed<ChangePasswordErrors>(() =>
    Object.fromEntries(
      CHANGE_PASSWORD_FIELDS.map((field) => {
        const clientError = v$.value[field].$errors[0]?.$message;
        return [field, clientError ? toValue(clientError) : server.fieldErrors.value[field]];
      })
    )
  );

  function touch(field: ChangePasswordField): void {
    v$.value[field].$touch();
  }

  async function validate(): Promise<boolean> {
    server.clear();
    return v$.value.$validate();
  }

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
    formError: server.formError,
    touch,
    validate,
    toPayload,
    applyServerError,
    reset,
  };
}
