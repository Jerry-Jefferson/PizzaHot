import type { ValidationRuleCollection } from "@vuelidate/core";
import { helpers, maxLength } from "@vuelidate/validators";

export interface PasswordRule {
  id: string;
  message: string;
  test: (password: string) => boolean;
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    message: `Password must be at least ${String(PASSWORD_MIN_LENGTH)} characters`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    message: "Password must contain at least one uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    message: "Password must contain at least one lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "digit",
    message: "Password must contain at least one digit",
    test: (password) => /\d/.test(password),
  },
  {
    id: "special",
    message: "Password must contain at least one special character",
    test: (password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
  },
];

export function passwordRuleValidators(): ValidationRuleCollection {
  return {
    ...Object.fromEntries(
      PASSWORD_RULES.map((rule) => [
        rule.id,
        helpers.withMessage(rule.message, (value: string) => value === "" || rule.test(value)),
      ])
    ),
    maxLength: helpers.withMessage(
      `Password must be at most ${String(PASSWORD_MAX_LENGTH)} characters`,
      maxLength(PASSWORD_MAX_LENGTH)
    ),
  };
}
