import { useToast } from "primevue/usetoast";

import { getErrorMessage } from "@/api/errors";

export const TOAST_LIFE_MS = 3000;

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
    showError: (error, summary = "Something went wrong") => {
      const detail = typeof error === "string" ? error : getErrorMessage(error);
      toast.add({ severity: "error", summary, detail, life: TOAST_LIFE_MS });
    },
  };
}
