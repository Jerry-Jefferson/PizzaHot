import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

export const PizzeriaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#fdf3f2",
      100: "#fbe4e2",
      200: "#f7cbc7",
      300: "#efa59f",
      400: "#e2736a",
      500: "#c8372d",
      600: "#ad2e25",
      700: "#8f261f",
      800: "#73211b",
      900: "#5f1f1a",
      950: "#340d0a",
    },
    surface: {
      0: "#ffffff",
      50: "#fafaf8",
      100: "#f5f1ee",
      200: "#eae3de",
      300: "#ddd3cc",
      400: "#b9aca4",
      500: "#8f817a",
      600: "#6b5e58",
      700: "#4a3f3b",
      800: "#2e2522",
      900: "#1c1412",
      950: "#120c0b",
    },
    focusRing: {
      color: "hsl(var(--ring))",
    },
    formField: {
      borderColor: "hsl(var(--border))",
      borderRadius: "var(--radius-control)",
    },
  },
});
