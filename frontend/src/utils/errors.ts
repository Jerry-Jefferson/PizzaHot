import { ApiError, type FieldErrors } from "@/services/errors";
import { FALLBACK_ERROR_MESSAGE } from "@/utils/constants/errors.constants";

export function getFieldErrors(error: unknown): FieldErrors {
  return error instanceof ApiError ? error.fieldErrors : {};
}

export function getErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined;
}

export function getFirstFieldErrors<TField extends string>(
  error: unknown,
  fields: readonly TField[]
): Partial<Record<TField, string>> {
  const fieldErrors = getFieldErrors(error);
  const result: Partial<Record<TField, string>> = {};
  for (const field of fields) {
    const message = fieldErrors[field]?.[0];
    if (message) {
      result[field] = message;
    }
  }
  return result;
}

export function isEmailNotVerifiedError(error: unknown): boolean {
  return getErrorStatus(error) === 403 && /email is not verified/i.test(getErrorMessage(error));
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : FALLBACK_ERROR_MESSAGE;
}
