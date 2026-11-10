# Pizza Hot — Frontend

Vue 3 + TypeScript single-page app, built with Vite.

## Stack

| Concern           | Library                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Framework / build | Vue 3, Vite, TypeScript (`vue-tsc`)                                                                             |
| Routing / state   | Vue Router, Pinia                                                                                               |
| Server state      | `@tanstack/vue-query` (client in `src/plugins/vue-query.ts`)                                                    |
| UI / styling      | PrimeVue (Aura theme), Tailwind CSS v4, `tailwindcss-primeui`                                                   |
| Form validation   | Vuelidate (`@vuelidate/core`, `@vuelidate/validators`)                                                          |
| Testing           | Vitest, `@vue/test-utils`, jsdom                                                                                |
| Lint / format     | ESLint (typescript-eslint strict type-checked, eslint-plugin-vue, simple-import-sort, unused-imports), Prettier |

PrimeVue styles are placed in the `primevue` CSS layer, ordered between Tailwind's `base`
and `utilities` (see `src/styles/main.css` and `src/plugins/primevue.ts`), so Tailwind
utility classes can override PrimeVue component styles.

## Scripts

Run from the `frontend/` directory. Requires Node `^22.18.0 || >=24.12.0`.

```bash
npm install          # install dependencies
npm run dev          # dev server with HMR
npm run build        # type-check (vue-tsc) + production build
npm run preview      # preview the production build
npm test             # run unit/component tests once
npm run test:watch   # tests in watch mode
npm run test:cov     # tests with v8 coverage
npm run lint         # ESLint, fails on any warning
npm run lint:fix     # ESLint with autofix (sorts imports, removes unused imports)
npm run format       # Prettier write
npm run format:check # Prettier check
```

## Layout

```
src/
  styles/main.css      Tailwind + PrimeUI entry, CSS layer order
  plugins/             PrimeVue and vue-query configuration
  router/              Vue Router
  stores/              Pinia stores
  views/               Route components
  main.ts              App bootstrap
tests/
  unit/                Vitest specs mirroring src/ (unit/stores/cart.spec.ts, unit/views/…)
```
