import { isAxiosError } from "axios";

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

export const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";
export const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";
const VALIDATION_ERROR_MESSAGE = "Please check the highlighted fields.";

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
