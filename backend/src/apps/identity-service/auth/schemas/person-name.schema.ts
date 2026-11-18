import { z } from "zod";

export const PERSON_NAME_MAX_LENGTH = 100;
const PERSON_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

export function personNameSchema(label: string) {
  return z
    .string({ error: `${label} must be a string` })
    .trim()
    .min(1, { message: `${label} must not be empty` })
    .max(PERSON_NAME_MAX_LENGTH, {
      message: `${label} must be at most ${String(PERSON_NAME_MAX_LENGTH)} characters`,
    })
    .regex(PERSON_NAME_PATTERN, {
      message: `${label} may contain only letters, spaces, apostrophes, periods and hyphens`,
    });
}
