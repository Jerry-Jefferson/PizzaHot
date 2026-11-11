import { isAxiosError } from "axios";

export type FieldErrors = Record<string, string[]>;

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

function responseBody(error: unknown): unknown {
  return isAxiosError(error) ? error.response?.data : undefined;
}

export function getFieldErrors(error: unknown): FieldErrors {
  const body = responseBody(error);
  if (!isValidationErrorBody(body)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(body.fieldErrors).filter(
      (entry): entry is [string, string[]] => !!entry[1]?.length
    )
  );
}

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : FALLBACK_ERROR_MESSAGE;
  }
  if (!error.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  const body: unknown = error.response.data;
  if (isValidationErrorBody(body)) {
    const firstFieldError = Object.values(getFieldErrors(error))[0]?.[0];
    return body.formErrors[0] ?? firstFieldError ?? VALIDATION_ERROR_MESSAGE;
  }
  if (isHttpErrorBody(body)) {
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    return message || FALLBACK_ERROR_MESSAGE;
  }
  return FALLBACK_ERROR_MESSAGE;
}
