import pizzaPlaceholderUrl from "@/assets/images/pizza-placeholder.svg";
import { API_BASE_URL } from "@/utils/constants/api.constants";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/utils/constants/limits.constants";

const ABSOLUTE_URL_PATTERN = /^(https?:|data:|blob:)/i;

const MEDIA_ORIGIN = /^https?:\/\//i.test(API_BASE_URL) ? new URL(API_BASE_URL).origin : "";

export const MEDIA_PLACEHOLDER_URL = pizzaPlaceholderUrl;

export function toMediaUrl(path: string | null | undefined): string {
  const trimmedPath = path?.trim();
  if (!trimmedPath) {
    return MEDIA_PLACEHOLDER_URL;
  }
  if (ABSOLUTE_URL_PATTERN.test(trimmedPath)) {
    return trimmedPath;
  }
  const normalizedPath = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
  return `${MEDIA_ORIGIN}${normalizedPath}`;
}

const ALLOWED_IMAGE_TYPE_SET: ReadonlySet<string> = new Set(ALLOWED_IMAGE_TYPES);

export const INVALID_IMAGE_TYPE_MESSAGE = "Use a JPG, PNG or WebP image.";
export const IMAGE_TOO_LARGE_MESSAGE = `The image must be ${String(MAX_IMAGE_BYTES / 1024 / 1024)} MB or smaller.`;

export function getImageFileError(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPE_SET.has(file.type)) {
    return INVALID_IMAGE_TYPE_MESSAGE;
  }
  return file.size > MAX_IMAGE_BYTES ? IMAGE_TOO_LARGE_MESSAGE : null;
}
