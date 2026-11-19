import { isAxiosError } from "axios";

import {
  FALLBACK_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  VALIDATION_ERROR_MESSAGE,
} from "@/utils/constants/errors.constants";

export type FieldErrors = Record<string, string[]>;

interface ApiErrorDetails {
  status: number | undefined;
  fieldErrors?: FieldErrors;
}

export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly status: number | undefined;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, { status, fieldErrors = {} }: ApiErrorDetails) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ValidationErrorBody {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

interface HttpErrorBody {
  message: string | string[];
}

function isValidationErrorBody(body: unknown): body is ValidationErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    Array.isArray((body as Partial<ValidationErrorBody>).formErrors) &&
    typeof (body as Partial<ValidationErrorBody>).fieldErrors === "object"
  );
}

function isHttpErrorBody(body: unknown): body is HttpErrorBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }
  const { message } = body as Partial<HttpErrorBody>;
  return typeof message === "string" || Array.isArray(message);
}

function parseFieldErrors(body: ValidationErrorBody): FieldErrors {
  return Object.fromEntries(
    Object.entries(body.fieldErrors).filter(
      (entry): entry is [string, string[]] => !!entry[1]?.length
    )
  );
}

function parseResponse(body: unknown): { message: string; fieldErrors: FieldErrors } {
  if (isValidationErrorBody(body)) {
    const fieldErrors = parseFieldErrors(body);
    const firstFieldError = Object.values(fieldErrors)[0]?.[0];
    return {
      message: body.formErrors[0] ?? firstFieldError ?? VALIDATION_ERROR_MESSAGE,
      fieldErrors,
    };
  }
  if (isHttpErrorBody(body)) {
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    return { message: message || FALLBACK_ERROR_MESSAGE, fieldErrors: {} };
  }
  return { message: FALLBACK_ERROR_MESSAGE, fieldErrors: {} };
}

export function toApiError(error: unknown): unknown {
  if (!isAxiosError(error)) {
    return error;
  }
  if (!error.response) {
    return new ApiError(NETWORK_ERROR_MESSAGE, { status: undefined });
  }
  const { message, fieldErrors } = parseResponse(error.response.data);
  return new ApiError(message, { status: error.response.status, fieldErrors });
}
