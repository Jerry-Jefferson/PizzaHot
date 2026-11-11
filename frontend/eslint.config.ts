import js from "@eslint/js";
import pluginVitest from "@vitest/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import skipFormatting from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default defineConfig(
  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**", "**/node_modules/**"]),

  // Base JS + strict, type-aware TypeScript rules.
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  // Vue 3 rules (essential + strongly-recommended + recommended).
  pluginVue.configs["flat/recommended"],

  {
    name: "app/typescript-and-vue",
    files: ["**/*.{ts,mts,tsx,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
      globals: { ...globals.browser },
    },
  },

  {
    name: "app/imports",
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      // Auto-sorted imports/exports (fixable with `npm run lint:fix`).
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Auto-removal of unused imports; unused variables still reported.
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],
    },
  },

  {
    name: "app/strict-typescript",
    files: ["**/*.{ts,mts,tsx,vue}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      "vue/block-lang": ["error", { script: { lang: "ts" } }],
      "vue/component-api-style": ["error", ["script-setup"]],
      // Type-based props are already optional in TS; this rule contradicts
      // @typescript-eslint/no-useless-default-assignment, which forbids `= undefined`.
      "vue/require-default-prop": "off",
    },
  },

  {
    ...pluginVitest.configs.recommended,
    name: "app/tests",
    files: ["tests/unit/**/*.{ts,tsx}"],
    rules: {
      ...pluginVitest.configs.recommended.rules,
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // Must be last: turns off rules that conflict with Prettier.
  skipFormatting
);
