import { useToast } from "primevue/usetoast";
import type { Plugin } from "vue";

import { GENERIC_ERROR_TITLE, TOAST_LIFE_MS } from "@/utils/constants/ui.constants";
import { logError } from "@/utils/logger";

export const errorHandlerPlugin: Plugin = {
  install(app) {
    const toast = app.runWithContext(() => useToast());
    app.config.errorHandler = (error, _instance, info) => {
      logError(`vue:${info}`)(error);
      toast.add({ severity: "error", summary: GENERIC_ERROR_TITLE, life: TOAST_LIFE_MS });
    };
  },
};
