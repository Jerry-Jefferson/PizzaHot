import { useToast } from "primevue/usetoast";

import { getErrorMessage } from "@/services/errors";
import { GENERIC_ERROR_TITLE, TOAST_LIFE_MS } from "@/utils/constants/ui.constants";

interface AppToast {
  showSuccess: (summary: string, detail?: string) => void;
  showError: (error: unknown, summary?: string) => void;
}

export function useAppToast(): AppToast {
  const toast = useToast();

  return {
    showSuccess: (summary, detail) => {
      toast.add({ severity: "success", summary, detail, life: TOAST_LIFE_MS });
    },
    showError: (error, summary = GENERIC_ERROR_TITLE) => {
      const detail = typeof error === "string" ? error : getErrorMessage(error);
      toast.add({ severity: "error", summary, detail, life: TOAST_LIFE_MS });
    },
  };
}
