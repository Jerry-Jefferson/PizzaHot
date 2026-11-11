import pizzaPlaceholderUrl from "@/assets/images/pizza-placeholder.svg";
import { API_BASE_URL } from "@/utils/constants/api";

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
