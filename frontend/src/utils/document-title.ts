import { APP_NAME } from "@/utils/constants/ui.constants";

export function formatDocumentTitle(title?: string | null): string {
  const trimmed = title?.trim();
  return trimmed ? `${trimmed} · ${APP_NAME}` : APP_NAME;
}
