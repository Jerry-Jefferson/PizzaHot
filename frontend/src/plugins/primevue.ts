import type { PrimeVueConfiguration } from "primevue/config";

import { PizzeriaPreset } from "./pizzeria-preset";

export const primeVueOptions: PrimeVueConfiguration = {
  theme: {
    preset: PizzeriaPreset,
    options: {
      prefix: "p",
      darkModeSelector: ".app-dark",
      cssLayer: {
        name: "primevue",
        order: "theme, base, primevue, components, utilities",
      },
    },
  },
};
