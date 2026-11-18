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
and `utilities` (see `src/assets/styles/main.css` and `src/plugins/primevue.ts`), so Tailwind
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

## Running against the backend

The SPA talks to the NestJS API gateway. In development Vite proxies `/api` and `/uploads`
to `http://localhost:3000` (`server.proxy` in `vite.config.ts`), so the browser only ever
sees `http://localhost:5173` and the auth cookie stays same-origin. To call another host
instead, set `VITE_API_BASE_URL`; it defaults to `/api`.

Required backend services (see `backend/README.md`):

| Service                | Needed for                                           |
| ---------------------- | ---------------------------------------------------- |
| `api-gateway`          | every request (port 3000)                            |
| `identity-service`     | sign up / sign in, profile, admin users              |
| `catalog-service`      | menu, pizza details, admin pizzas and ingredients    |
| `cart-service`         | cart                                                 |
| `order-service`        | checkout, my orders, admin orders                    |
| `promocode-service`    | promo codes in the cart and admin promo codes        |
| `analytics-service`    | admin dashboard and analytics                        |
| `notification-service` | verification and order emails (shown in MailHog)     |
| `log-service`          | optional; stores service logs in MongoDB             |
| RabbitMQ, PostgreSQL   | every service; MongoDB for `log-service`             |
| MailHog                | reading verification emails at http://localhost:8025 |

```bash
cd backend
cp .env.example .env                 # set ADMIN_EMAIL / ADMIN_PASSWORD here
docker compose up --build -d         # infrastructure + all services
docker compose exec identity-service node dist/apps/identity-service/migrate.js

cd ../frontend
npm install
npm run dev                          # http://localhost:5173
```

### Test accounts

- **Admin:** created by the identity-service `SeedAdminUser` migration from `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` in `backend/.env` (the example file documents `admin@example.com` /
  `password`). Admins land on `/admin`.
- **Customer:** sign up at `/sign-up`, then open the verification email in MailHog
  (http://localhost:8025).

## Continuous integration

`.github/workflows/frontend-ci.yml` runs on changes under `frontend/`: `npm ci`, `lint`,
`type-check`, `test` and `build-only` on Node 24.

## Layout

```
src/
  assets/styles/       Tailwind + PrimeUI entry, CSS layer order, design tokens
  plugins/             PrimeVue, vue-query and global error handler
  router/              Vue Router
  stores/              Pinia stores
  views/               Route components
  main.ts              App bootstrap
tests/
  unit/                Vitest specs mirroring src/ (unit/stores/cart.spec.ts, unit/views/…)
```
