# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo with two independent npm projects — there is **no root `package.json`**, so every `npm`/`npx`/`docker compose` command must run from inside `backend/` or `frontend/`.

- `backend/` — NestJS 11 microservices (ESM, RabbitMQ, PostgreSQL, MongoDB). Has its own `README.md`.
- `frontend/` — Vue 3 + Vite SPA. Has its own `README.md`. Not yet wired to the backend API.
- `.github/workflows/ci.yml` — backend-only CI (`working-directory: backend`, triggers on `backend/**`): eslint `--max-warnings=0`, `tsc --noEmit`, build, unit tests with coverage, e2e. There is no frontend CI yet.
- `.claude/` — after every Write/Edit, `hooks/post-edit-check.mjs` runs lint (with `--fix`) and unit tests for whichever app the edited file is in (`backend/` or `frontend/`; other paths are skipped) and reports failures back with exit code 2. Skills `code-review` and `testing` describe backend conventions.
- `.mcp.json` — read-only DB access for Claude: `postgres-<identity|catalog|cart|order|promo|analytics>` (one per service DB, Postgres MCP Pro in Docker, `--access-mode=restricted`) and `mongodb` (log-service data, `mongodb-mcp-server --readOnly`). All go through `.claude/mcp/launch.mjs`, which reads credentials from `backend/.env`; start the infra with `docker compose up -d pgdb mongodb` first.

Both projects share one Prettier style: double quotes, semicolons, width 100 (`frontend/.prettierrc` mirrors `backend/.prettierrc`).

## Code Comments

- **Do not write code comments** (in either English or Russian) if the code is self-explanatory.
- Code must be self-documenting: use clear and descriptive names for variables, functions, and components.
- Exception: complex algorithms, business logic with non-obvious constraints, or bug workarounds where explanations are strictly necessary.

## Backend (`cd backend`)

```bash
npm run build                                  # nest build → dist/apps/<app>/main.js for every app
npm run lint                                   # eslint src test --fix (CI runs without --fix, --max-warnings=0)
npx tsc --noEmit                               # type-check, as CI does
npm test                                       # all unit tests (Jest, native ESM)
npm test -- --testPathPattern="pizzas.service" # single test file
npm test -- -t "creates a pizza"               # single test by name
npm run test:cov                               # coverage; thresholds enforced (90 stmts/lines, 85 funcs, 73 branches)
npm run test:e2e                               # test/ with test/jest-e2e.json
npm run migration:run                          # identity-service migrations; runs dist/, so build first

docker compose up -d pgdb mongodb rabbitmq mailhog   # infra only, for local dev
docker compose up --build -d                          # full stack
node dist/apps/<app>/main.js                          # run one built service (what the Dockerfile does)
npx nest start --watch --entryFile apps/<app>/main    # run one service in watch mode
```

- Always run tests through the `npm` scripts: they pass `--experimental-vm-modules`; invoking `jest` directly breaks ESM.
- `nest-cli.json` has no `projects`, so `nest start <app-name>` does **not** select an app — use `--entryFile` as above.
- Services read `.env` from the working directory (`ConfigModule.forRoot`), so run them from `backend/`. Copy `.env.example` first.
- With RabbitMQ unreachable, services hang at startup **without printing anything** (`bufferLogs: true` holds logs until init completes). Start infra first.
- Swagger is served at `http://localhost:3000/api-docs` (the README's `/api/docs` is wrong); REST routes are under the `/api` prefix.

### Architecture

Nine apps in `src/apps/*` (each with its own `main.ts`, built into one `dist/`, one Docker image parameterised by `APP_NAME`) plus shared code in `src/libs/*`. Services never call each other over HTTP; everything goes through RabbitMQ.

- **Request path:** HTTP → `api-gateway` controller (`controllers/<feature>/`) → gateway client (`clients/<service>.client.ts`) → `rpc()` from `libs/messaging/rpc.util.ts` (`client.send` + `RPC_TIMEOUT_MS` timeout, RPC errors mapped back to HTTP exceptions) → owning service's `@MessagePattern` handler. The gateway holds no domain logic.
- **Events:** services `emit` fire-and-forget events to the `pizzahot.events` topic exchange; consumers use `@EventPattern` (notification, analytics, log, cart, catalog, order, promocode all consume some). Each service listens on its own durable queue (`QUEUE` in `libs/messaging/rmq.config.ts`) with manual ack (`RpcAckInterceptor`).
- **Contracts:** every RPC pattern and event name is a constant in `libs/contracts/patterns.constant.ts` (`RPC.<service>.<action>`, `EVENTS.*`); event payload types are in `events.types.ts`. Never hardcode pattern strings.
- **Service bootstrap:** non-gateway services call `bootstrapService(Module, QUEUE.x)` from `libs/messaging/bootstrap.ts`, which installs `RpcExceptionFilter` and `RpcAckInterceptor`. Clients are registered via `MessagingModule.register([...TOKENS])`.
- **Auth:** global guards in `gateway.module.ts`, in order `ThrottlerGuard → JwtAuthGuard → PermissionsGuard`. Routes are protected by default; opt out with `@Public()`. JWT is read from the auth cookie first, then the `Authorization: Bearer` header. Authorization is permission-based (`@Can(...)`, `libs/auth/permission.constant.ts`), with role→permission mapping there.
- **Logging:** `RmqLoggerService` extends `ConsoleLogger` and also publishes each log as an `EVENTS.logWritten` event; `log-service` stores them in MongoDB (the only Mongo user). All other services use PostgreSQL via TypeORM; only `identity-service` has migrations (`data-source.ts`, `migrate.ts`, `migrations/`).
- **Validation:** Zod 4 schemas with `ZodValidationPipe` (`libs/validation`). DTOs live in the owning service (`src/apps/<service>/<feature>/dto/`) and the gateway imports their types from there.
- **Cross-cutting libs:** `price-calculation` (shared pricing for cart/catalog/order), `pagination`, `upload` (Multer; files in `./uploads`, served by the gateway at the uploads prefix), `swagger` (doc decorators; gateway docs live in `*.api-docs.ts` next to each controller), `mocks` (shared Jest mocks).

### Conventions

- Native ESM (`"type": "module"`, `rewriteRelativeImportExtensions`): relative imports **must** include the `.ts` extension (`import { X } from "./x.ts"`). No path aliases — imports are relative.
- Unit tests live in a `tests/` subfolder next to the code (`src/apps/<app>/tests/*.spec.ts`, `src/libs/<lib>/tests/*.spec.ts`), import from `@jest/globals`, and mock repositories/clients with typed `jest.fn<...>()`. See `.claude/skills/testing/SKILL.md` for the established patterns.
- Coverage excludes `main.ts`, `*.module.ts`, `*.entity.ts`, `*.repository.ts`, `*.types.ts`, `*.constant.ts`, `*.api-docs.ts`, `dto/**` (except `*-response.dto.ts`) — see `jest.collectCoverageFrom` in `package.json`.
- Adding a feature end-to-end: pattern constant in `contracts` → handler in the owning service → method on the gateway `*.client.ts` → gateway controller + `*.api-docs.ts` → tests.

## Frontend (`cd frontend`)

```bash
npm run dev                      # Vite dev server
npm run build                    # vue-tsc --build (type-check) + vite build, in parallel
npm run lint                     # eslint . --max-warnings=0
npm run lint:fix                 # also sorts imports and deletes unused imports
npm test                         # vitest run
npx vitest run tests/unit/views/HomeView.spec.ts     # single file
npx vitest run -t "accepts a valid email"             # single test by name
npm run test:cov
npm run format / format:check
```

- Stack: Vue 3 `<script setup lang="ts">` (enforced by ESLint), Vue Router, Pinia, `@tanstack/vue-query` (client in `src/plugins/vue-query.ts`), Vuelidate, PrimeVue 5 (Aura) + Tailwind CSS v4 + `tailwindcss-primeui`, Vitest + `@vue/test-utils` (jsdom).
- `@/` aliases `src/`. Tests live in `frontend/tests/unit/`, mirroring `src/` (`src/stores/cart.ts` → `tests/unit/stores/cart.spec.ts`); see the `frontend-tests` skill.
- CSS layer order is declared in `src/assets/main.css` (`theme, base, primevue, components, utilities`) and must match `cssLayer` in `src/plugins/primevue.ts` — this is what lets Tailwind utilities override PrimeVue styles.
- ESLint (`eslint.config.ts`) uses `typescript-eslint` `strictTypeChecked` with the project service. Plain TypeScript can't read `.vue` files, so `env.d.ts` declares a `*.vue` module fallback; removing it makes every `.vue` import an "unsafe error-typed value".
- Type-checking uses TypeScript 6 via `vue-tsc --build` across `tsconfig.app.json` / `tsconfig.node.json` / `tsconfig.vitest.json`.
- npm 11.4.x crashes (`Cannot read properties of null (reading 'edgesOut')`) when adding packages here; use npm ≥ 12 (`npx -p npm@12 npm install <pkg>`). `allowScripts` in `package.json` whitelists `vue-demi`'s postinstall.
