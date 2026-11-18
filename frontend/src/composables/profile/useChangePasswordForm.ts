import { helpers, required, sameAs } from "@vuelidate/validators";
import { type ComputedRef, reactive, type Ref, toRef } from "vue";

import { useValidatedForm } from "@/composables/common/useValidatedForm";
import { getErrorStatus } from "@/services/errors";
import type {
  ChangePasswordErrors,
  ChangePasswordField,
  ChangePasswordFormValues,
  ChangePasswordPayload,
} from "@/types/user.types";
import { passwordRuleValidators } from "@/utils/password-rules";

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

export function useChangePasswordForm(): ChangePasswordForm {
  const form = reactive<ChangePasswordFormValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const rules = {
    currentPassword: {
      required: helpers.withMessage("Current password is required", required),
    },
    newPassword: {
      required: helpers.withMessage("New password is required", required),
      ...passwordRuleValidators(),
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
