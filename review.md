# PizzaHot — Code Review

**Date:** 2026-11-18 · **Branch:** `feature/polish` (working tree incl. uncommitted changes) · **Scope:** whole monorepo (`backend/`, `frontend/`, CI, Docker, `.claude/` tooling)

No code was changed as part of this review.

## Automated checks

| Check | Result |
|---|---|
| Backend `eslint src test --max-warnings=0` | ✅ clean |
| Backend `tsc --noEmit` | ✅ clean (but `strict` is off — see M-14) |
| Backend unit tests | ✅ 43 suites / 547 tests pass |
| Frontend `eslint . --max-warnings=0` | ✅ clean |
| Frontend `vue-tsc` (app) | ✅ clean |
| Frontend unit tests | ⚠️ 942/943 — `AdminPizzasView.spec.ts › opens the add and edit pages` failed in the full run but passes in isolation → **flaky** |
| `npm audit --omit=dev` backend | ❌ 15 vulns (1 critical, 8 high, 6 moderate) — direct: `@nestjs/microservices`, `@nestjs/platform-express`, `mongoose`, `nodemailer`, `zod`, `typeorm`, `@nestjs/swagger`; critical is transitive `proxy-addr` |
| `npm audit --omit=dev` frontend | ❌ 8 high — direct: `vite`, `vue-router` |

## Summary

The architecture is clean and consistently applied: thin gateway, contracts centralised, user identity always taken from the JWT, permission-based authorization on every admin route, centralised pricing, solid frontend type-safety and error handling. The main risks are **operational/data-integrity** rather than code style:

1. Failed RabbitMQ events are silently **discarded** (the "DLQ" does not exist).
2. Only `synchronize` creates the database schema — there are **no schema migrations**, so a real `NODE_ENV=production` deploy starts with empty DBs.
3. Several **multi-step writes are not atomic** (order + items, check-then-insert uniqueness, cart increments).
4. **User input lands unescaped in email HTML** (phishing vector).
5. The repo **tracks ~38 000 generated files** (`backend/node_modules`, `dist`, `coverage`, uploads).

Severity legend: 🔴 **High** — bug, data loss or security issue likely to bite · 🟠 **Medium** — real defect with narrower trigger, or important hardening · 🟢 **Low** — maintainability, conventions, dead code, docs.

---

## 🔴 High

### H-1 · Failed events are dropped, not dead-lettered
`backend/src/libs/messaging/ack.ts:18-24`, `backend/src/libs/messaging/rmq.config.ts:31`, `backend/src/libs/messaging/messaging.module.ts:40,54`

`ack()` logs *"routing to DLQ"* and calls `channel.nack(msg, false, false)`, but no queue declares `x-dead-letter-exchange` (`queueOptions` is only `{ durable: true }`) and there is no broker policy in the repo. RabbitMQ therefore **deletes** the message.
**Impact:** any transient failure (Postgres restart, deadlock, Mongo down, SMTP blip) permanently loses `order.created` (cart not cleared, promocode not confirmed, analytics wrong), `pizza.updated` (stale cart snapshot), `user.deleted`, etc. The log message actively misleads operators. Tests named "sends to DLQ" only assert `nack` was called.
**Fix:** declare a DLX + `<queue>.dlq` per service via `queueOptions.arguments`, ideally with a bounded retry (TTL retry queue / redelivery count) before dead-lettering.

### H-2 · No schema migrations; schema exists only via `synchronize`
`backend/src/libs/database/typeorm.config.ts:12`, `backend/src/apps/identity-service/data-source.ts:13`, `backend/src/apps/identity-service/migrations/1790000000000-SeedAdminUser.ts`, `backend/Dockerfile:17`

`synchronize: NODE_ENV !== "production"`. The Dockerfile sets `NODE_ENV=production`, but compose's `env_file: .env` overrides it to `development`. Identity's only migration is a data seed that `INSERT`s into a `users` table no migration creates; catalog, cart, order, promocode and analytics have no migrations at all.
**Impact:** today every container auto-alters schemas on boot (can drop columns/data on entity changes, and also makes the auth cookie non-`secure`). Deploying with `NODE_ENV=production` as intended → all services start against empty DBs, `migration:run` fails with *relation "users" does not exist*.
**Fix:** generate an initial schema migration per service DB (before the identity seed), drive `synchronize` by an explicit flag that is off outside tests, run migrations as a deploy step.

### H-3 · Generated artifacts committed to git
Root `.gitignore` uses root-anchored patterns (`/node_modules`, `/dist`, `/coverage`) that only match at the repo root, so after the monorepo split git tracks **~37 650 files in `backend/node_modules`**, 655 in `backend/dist`, 381 in `backend/coverage`, plus `backend/uploads/pizzas/*.png`.
**Impact:** huge clone/diff noise, platform-specific binaries in history, merge conflicts on every `npm install`, stale build output, and user uploads in VCS.
**Fix:** use unanchored patterns (`node_modules/`, `dist/`, `coverage/`, `backend/uploads/`), then `git rm -r --cached` those paths.

### H-4 · HTML injection in transactional emails
`backend/src/apps/notification-service/templates/account-registered.template.ts:14`, `email-verification.template.ts:19`, `critical-error.template.ts:26-42`; input schema `backend/src/apps/identity-service/auth/schemas/auth.schema.ts:7`

`${name}` (and in the critical-error template the user-controlled `request.url` and error message) is interpolated into HTML unescaped; `name` is `z.string().optional()` with no length/charset limit.
**Impact:** an attacker signs up with a *victim's* email and a name like `<a href="https://evil">Verify now</a>` → PizzaHot sends branded phishing to the victim from its own sender. The admin alert email is injectable the same way.
**Fix:** `escapeHtml()` every interpolated value in all templates; constrain `name` (max length, allowed characters); add template escaping tests.

### H-5 · Order and order items are not saved atomically
`backend/src/apps/order-service/orders.service.ts:113-149`

`ordersRepository.save(order)` then `orderItemsRepository.saveMany(...)` are separate writes. If the second fails, the catch emits `orderFailed` (releasing the promocode) and rethrows, but the order row stays committed.
**Impact:** a PENDING order with zero items and a real `finalPrice` appears in "My orders" and the admin list, and the promocode is freed as well.
**Fix:** one `dataSource.transaction`, or assign items to `order.orderItems` (already `cascade: true`) and do a single `save`.

### H-6 · Nightly cleanup cron hard-deletes pizzas, bypassing the service
`backend/src/apps/catalog-service/pizzas/pizza-cleanup.service.ts:17-33`, `pizzas.repository.ts:85-95`

Every night it `DELETE`s every pizza not ordered in 30 days, **including never-ordered pizzas older than 30 days**, without emitting `pizzaDeleted` and without removing images.
**Impact:** curated menu items silently disappear; cart-service's snapshot keeps them so customers can still add them and then fail at checkout ("no longer available"); image files are orphaned; no audit trail.
**Fix:** reconsider the feature; if kept, go through `PizzasService.remove` per pizza (event + image cleanup) or soft-delete/mark unavailable.

### H-7 · Users with a 6–7 character password can never change it
Backend: `backend/src/apps/identity-service/auth/schemas/password.schema.ts:5` (signup min 6) vs `backend/src/apps/identity-service/users/user.schema.ts:72-80` (`currentPassword` min 8). Frontend mirrors it: `frontend/src/composables/useChangePasswordForm.ts:15-16,58`.

Additionally `newPassword` only checks length (8–128), skipping the complexity rules required at signup — a user can switch to `aaaaaaaa`. Signup has no max, while bcrypt silently truncates at 72 bytes.
**Fix:** one shared `passwordSchema` (with max) for signup and `newPassword`; `currentPassword` just `min(1)`. Mirror on the frontend with `PASSWORD_RULES`.

### H-8 · Vulnerable production dependencies
See the audit table above. The backend has a critical (`proxy-addr`, via Express) and highs in `multer`, `body-parser`, `nodemailer`, `mongoose`, `zod`, `@nestjs/*`; the frontend has highs in `vite` and `vue-router`.
**Fix:** `npm audit fix` / bump the direct dependencies; add `npm audit --omit=dev --audit-level=high` to CI.

---

## 🟠 Medium

### Security & auth

**M-1 · Role / account changes don't take effect until the JWT expires** — `backend/src/libs/auth/guards/permissions.guard.ts:28`, `jwt-auth.guard.ts:60`, `identity-service/users/users.service.ts:204-216`
Role comes straight from a 1-day JWT, with no revocation. A demoted admin keeps admin permissions for up to 24h; a user who deleted their account can still call `/carts` and `/orders` with a bearer token; password change doesn't invalidate sessions.
*Fix:* short-lived access + refresh tokens, or a `tokenVersion`/`passwordChangedAt` claim checked (cached) by the guard.

**M-2 · Stale cookie shadows the bearer header; logout can't clear an expired cookie** — `backend/src/libs/auth/guards/jwt-auth.guard.ts:65-67`, `controllers/auth/auth.controller.ts:78-83`, `libs/auth/auth.constant.ts:3`
The cookie is always tried first and an invalid one throws (no fallback to the header). Cookie `maxAge` is a hard-coded 24h independent of `JWT_EXPIRATION`. `POST /auth/logout` isn't `@Public()`, so with an expired cookie it returns 401 and never clears it. On the frontend this triggers two navigations plus a misleading "Sign-out failed" toast (`frontend/src/services/interceptors.ts:10-14`, `frontend/src/composables/useSignOut.ts:13-20`).
*Fix:* make logout `@Public()`, derive cookie `maxAge` from the JWT expiry, fall back to the header; exclude `/auth/logout` from the frontend 401 handler.

**M-3 · Email verify/decline are state-changing GETs** — `backend/src/apps/api-gateway/controllers/auth/auth.controller.ts:44-56`, `notification-service/templates/email-verification.template.ts:11-12,28-42`
Corporate link scanners (Safe Links, etc.) fetch every link; if "decline" is fetched, the token is consumed and the user can never verify, which blocks `POST /orders` (`EmailVerifiedGuard`). `token` also bypasses Zod (`@Query("token") token: string` may be undefined or an array).
*Fix:* link to a frontend page that confirms with a POST; validate `token` with a schema.

**M-4 · Expired verification tokens are a dead end** — `identity-service/auth/auth.service.ts:29-30,73-79`, `libs/contracts/patterns.constant.ts`
The token lives 30 min, is nulled on expiry, and no "resend verification" RPC exists. Tokens are stored raw and unindexed.
*Fix:* add a resend pattern + endpoint, consider a longer TTL, store a hash, index the column.

**M-5 · Uploads: rejected/failed files stay on disk; content never checked** — `controllers/users/users.controller.ts:104-111`, `controllers/pizzas/pizzas.controller.ts:98-105`, `libs/upload/image-multer.config.ts:25-41`, `libs/upload/image-validation.pipe.ts`
Multer writes `<uuid><original ext>` before `ImageValidationPipe` runs; `fileFilter` trusts the client `Content-Type`. On pipe rejection or RPC failure nothing unlinks the file. No magic-byte check.
*Impact:* any logged-in user can fill `./uploads` (shared by three containers) with 5 MB files, including `.html` files that are then served same-origin from `/uploads` without `nosniff`.
*Fix:* check extension in `fileFilter`, unlink on any failure, validate magic bytes.

**M-6 · Security baseline gaps in the gateway** — `backend/src/apps/api-gateway/main.ts:17-18,35`, `gateway.module.ts:42`
`app.enableCors()` with no options (allows `*`); no `helmet` (no `nosniff`/HSTS/frame-ancestors on API or uploads); throttler keys on `req.ip` but `trust proxy` is never set — behind a proxy all clients share one 100/min and one 5/min login bucket (trivial global lockout, no per-attacker limiting). Swagger is served in production too.
*Fix:* CORS allow-list from env, `helmet()`, configure `trust proxy`, gate Swagger by env.

**M-7 · Infra secrets and exposure** — `backend/Dockerfile`, `backend/docker-compose.yaml:6-7,25-27,44-45,62-63,79-81`, `backend/src/libs/database/typeorm.config.ts:8-9`
Containers run as root with no `HEALTHCHECK`; every service gets the whole `.env` (log/notification services receive `JWT_SECRET`, `ADMIN_PASSWORD`, DB superuser creds); all services use one Postgres superuser across all six DBs (DB-per-service in name only); Postgres, Mongo, RabbitMQ (+ management, `guest/guest` defaults) and MailHog are published on all interfaces.
*Fix:* `USER node`, healthchecks, per-service env, per-service DB roles, bind ports to `127.0.0.1`, remove `guest` fallbacks.

**M-8 · Claude MCP DB access uses root credentials** — `.claude/mcp/launch.mjs:46,56,68,92`
Postgres superuser / Mongo root, read-only relies solely on server flags; `crystaldba/postgres-mcp` image unpinned; the whole `backend/.env` is passed to the `npx` child env; `host.docker.internal` won't resolve on Linux without `--add-host`.
*Fix:* dedicated read-only DB roles, pin the image by digest, pass only the connection string.

**M-9 · The Bash safety hook likely enforces nothing** — `.claude/hooks/safety-check.js:42-64`, `.claude/settings.json:5`
It prints a top-level `{"decision":"deny"|"ask"|"allow"}`, whereas PreToolUse hooks expect `hookSpecificOutput.permissionDecision` (the legacy top-level field only accepted `approve`/`block`). The matcher is only `Bash`, while this Windows environment also has a `PowerShell` tool. Additionally `/DROP/i` matches "dropdown", lines are joined without newlines (breaking `$` anchors), and unparsable input is allowed.
*Fix:* emit the documented output shape (or exit 2 with stderr), match `Bash|PowerShell`, tighten the regexes.

**M-10 · Personal data retained after account deletion** — `analytics-service/analytics.repository.ts:101-103`, `notification-service/templates/account-deleted.template.ts:10`, `notification-service/email/email.service.ts:29`
Deletion only sets `isDeleted = true`; `user_facts.email/name` and `order_facts.userEmail` remain, while the email tells the user *"All your personal data has been removed"*. Recipient addresses are logged and stored in Mongo for 30 days.
*Fix:* anonymise on `userDeleted`, mask emails in logs.

### Data integrity & concurrency

**M-11 · Check-then-insert uniqueness races return 500 instead of 409** — `identity-service/users/users.service.ts:46-65`, `catalog-service/pizzas/pizzas.service.ts:40-51`, `catalog-service/ingredients/ingredients.service.ts:18-24`, `promocode-service/promocodes.service.ts:32-42`, `cart-service/carts.repository.ts:33-41`
`buildRpcErrorPayload` (`libs/messaging/rpc-error.ts:61`) maps every non-HttpException to 500. A double-submitted signup returns "Internal server error"; `findOrCreate` for a new user's cart fails when the SPA fires `GET /cart` and `POST /cart/items` together.
*Fix:* map `QueryFailedError` code `23505` → `ConflictException`; use `INSERT … ON CONFLICT DO NOTHING` + select for carts.

**M-12 · Cart `addItem` loses updates** — `cart-service/carts.service.ts:94-118`
Read → `quantity + n` → save. Concurrent adds lose increments; two first-time adds hit the `(cart, pizza)` unique constraint → 500.
*Fix:* `INSERT … ON CONFLICT (cart_id, pizza_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity` with the max check.

**M-13 · Checkout: no idempotency, cart cleared wholesale, fixed-delay frontend refetch** — `order-service/orders.service.ts:48-181`, `cart-service/cart.controller.ts:132-140`, `cart-service/carts.service.ts:203-205`, `frontend/src/composables/useCreateOrder.ts:9,28-37`
Double submit, or a client retry after the gateway's `RPC_TIMEOUT_MS` 504 while order-service is still working, creates duplicate orders. `onOrderCreated` clears the *entire* cart, including items added after the snapshot. The frontend refetches the cart after a hard-coded 1 s (timer never cleared); if the event takes longer, the just-ordered items reappear as fresh data for 30 s and can be re-ordered.
*Fix:* idempotency key or cart checkout lock/version; have `orderCreated` carry and remove only the snapshotted items; drive the frontend refresh from a server signal, not a timer.

**M-14 · Order status has no state machine; cancel doesn't release the promocode** — `order-service/orders.service.ts:228-246`, `order-service/order.controller.ts:69-85`, frontend `frontend/src/composables/useOrderDetails.ts:23-57`
Any transition is accepted (`completed → pending`, `cancelled → delivering`); the event fires even when the status is unchanged; a cancelled order keeps its redemption confirmed. The admin modal acts on a stale row snapshot (`getOrder` in `frontend/src/services/api/orders.ts:26` exists but is unused), so two admins can cancel a completed order.
*Fix:* allowed-transitions map in the service (400 otherwise), emit from the service only on change, decide on promocode release; refetch the order in the modal.

**M-15 · Reaped reservation lets a promocode be redeemed again** — `promocode-service/redemptions/redemptions.service.ts:44-63`, `redemptions.repository.ts:33-38`
The reaper deletes PENDING rows older than 15 min; `confirm` updates by `(userId, promocodeId)` and silently affects 0 rows if the row is gone (e.g. `orderCreated` delayed by a backlog). The order keeps the discount and the code is reusable.
*Fix:* make `confirm` an upsert.

**M-16 · Promocode codes not normalised on write; soft-deleted codes block re-creation** — `promocode-service/promocode.schema.ts:6-10,37-39`, `promocodes.service.ts:32,41,64,80`, `promocode.entity.ts:22`
Lookup uppercases but create/update store the code as typed (only the frontend uppercases), so an API-created `summer10` can never be applied and `Summer10`/`SUMMER10` can coexist. The column `unique: true` also covers soft-deleted rows, while the conflict check excludes them → re-creating a deleted code returns 500.
*Fix:* `.toUpperCase()` in both Zod schemas; partial unique index `WHERE "deletedAt" IS NULL` or a 409 suggesting restore.

**M-17 · Emails not normalised** — `identity-service/auth/schemas/auth.schema.ts:9,27`, `users/users.repository.ts:49-51`
`John@x.com` and `john@x.com` become two accounts; users who registered with capitals can't log in in lowercase.
*Fix:* `.trim().toLowerCase()` in signup/login/create schemas, plus `citext` or a unique index on `lower(email)`.

**M-18 · "Last admin" guard is racy and bypassed by self-delete** — `identity-service/users/users.service.ts:147-154,160-187`
Two admins demoting each other concurrently both pass `countByRole`; `remove` (delete-me) has no last-admin check. The frontend makes this reachable: admins can open the customer `/profile` page with "Delete my account" (`frontend/src/router/routes.ts:5`, `frontend/src/components/layout/AppHeader.vue:43`).
*Fix:* transactional count + update (`FOR UPDATE`), same guard in `remove`; redirect admins from `/profile` to the admin profile.

**M-19 · Cart pizza snapshot has no backfill and no ordering guard** — `cart-service/cart.controller.ts:86-110,142-150`, `snapshots/pizza-snapshot.repository.ts:24-26`, `catalog-service/seed/seed.service.ts:15`
Catalog seeds in `onModuleInit`; if cart's queue isn't bound yet (first `compose up`) or `cart_db` is reset, `pizzaCreated` events are lost and every `addItem` returns "Pizza not found" until each pizza is edited. With prefetch 10, a late `pizzaUpdated` can resurrect a deleted snapshot.
*Fix:* resync RPC on startup when the snapshot table is empty; carry `updatedAt`/version and ignore stale upserts.

**M-20 · Analytics is wrong under redelivery / reordering and counts cancelled orders** — `analytics-service/analytics.controller.ts:44-52`, `analytics.repository.ts:29-74,94,105-107`
The `orderCreated` upsert always resets `status` to `pending`; `orderStatusChanged` arriving first updates 0 rows and is lost; reports don't filter cancelled orders or deleted users; item facts are keyed by `pizzaName` (a rename splits stats) and "most ordered" ignores `quantity`.
*Fix:* don't overwrite status on conflict, filter `status <> 'cancelled'` and deleted users, key on `pizzaId`, sum quantities.

**M-21 · Failed emails are acked and lost** — `notification-service/notifications.service.ts:23-33`, `notifications.controller.ts:24`
`Promise.allSettled` swallows channel errors, so `ack()` always acks. A short SMTP outage = verification emails silently never sent. (Depends on H-1 for retries.)
*Fix:* rethrow when all channels fail.

**M-22 · Critical-error alerts fire for every 5xx, including upstream timeouts** — `backend/src/libs/logging/critical-error.filter.ts:61-78`, `notification-service/notifications.controller.ts:64-75`
One slow service → one admin email per failed request (alert storm during an outage), and the email is injectable (H-4).
*Fix:* alert only on unexpected (non-HttpException) 500s; dedupe/rate-limit by `errorType + path`.

### Frontend

**M-23 · Query cache isn't scoped to the user** — `frontend/src/stores/auth.ts:23-35,44-54`, `frontend/src/composables/useRefreshSession.ts:28-30`
`restoreSession` on 401 sets `user = null` without `queryClient.clear()` (`/auth/me` is excluded from the 401 interceptor), and `signIn`/`signUp` don't clear it. User B signing in on the same browser can briefly see user A's cart and orders.
*Fix:* clear the query cache whenever the authenticated user id changes.

**M-24 · "Customers" metrics include admins** — `frontend/src/views/admin/AdminDashboardView.vue:13,41`, `frontend/src/views/admin/AdminUsersView.vue:41-47`, `frontend/src/composables/useUsers.ts:57-63`
`GET /users` has no role filter, so `total` counts every account.
*Fix:* add a `role` filter to the backend list, or relabel as "users".

### Tooling

**M-25 · Backend TypeScript is not strict** — `backend/tsconfig.json`
No `"strict": true` (so no `strictNullChecks`; `strictPropertyInitialization: false` is a no-op). Null/undefined bugs pass CI, while the frontend runs `strictTypeChecked`.
*Fix:* enable `strict` (at least `strictNullChecks`) and fix the fallout.

---

## 🟢 Low

### Backend — correctness & robustness
- `backend/src/libs/messaging/rpc.util.ts:5` — `RPC_TIMEOUT_MS` is read at import time, before `ConfigModule` loads `.env`, so the `.env` value is ignored for local runs (it only works as a real process env var). Note that the local `backend/.env` is also missing `RPC_TIMEOUT_MS` compared with `.env.example`.
- `backend/src/libs/auth/guards/email-verified.guard.ts:49-57` — swallows 503/504 from identity and returns 403 "Email is not verified".
- `identity-service/users/users.service.ts:209` — wrong current password returns 401 (same as "session expired"), forcing a frontend special case in `services/interceptors.ts`; use 400/403.
- `backend/src/libs/auth/guards/permissions.guard.ts:17-19` — default-allow: an authenticated route without `@Can` is open to every role. Consider default-deny or a test that walks all routes' metadata.
- `identity-service/auth/auth.service.ts:110-119` — login returns before bcrypt for unknown emails (timing-based account enumeration).
- `controllers/auth/auth.controller.ts:41,69` — the JWT is returned in the body as well as the httpOnly cookie, which undoes httpOnly's XSS protection; the frontend doesn't use it (`frontend/src/types/auth.types.ts:41`).
- `catalog-service/pizzas/pizza.schema.ts:9-11,25-27` — price has no max or 2-decimal constraint (overflow of `decimal(10,2)` → 500; 9.999 silently rounded).
- `catalog-service/pizzas/pizzas.service.ts:130-150`, `identity-service/users/users.service.ts:164-176` — the image is deleted before the DB row; if the DB delete fails, the entity keeps a broken image. Delete the row first.
- `isAvailable` is hard-coded `true` (`catalog-service/pizzas/pizzas.service.ts:195`), so every downstream `!isAvailable` check is dead code.
- Event emits not wrapped in try/catch (skill checklist §3): `order-service/orders.service.ts:142,168`, `order.controller.ts:82`, `identity-service/identity.controller.ts:42`, `catalog-service/catalog.controller.ts:63`, `pizzas.service.ts:198`.
- Domain logic in service controllers: `identity.controller.ts:36-45` (token validated twice, emits), `order.controller.ts:69-96`, `catalog.controller.ts:60-84,114-126`, `cart.controller.ts:68-84` use repositories/emits directly.
- `backend/src/libs/validation/zod-validation.pipe.ts:13` — validation errors return `{formErrors, fieldErrors}` with no `statusCode`/`message`, unlike every other error; logged as "Bad Request Exception".
- `backend/src/libs/logging/rmq-logger.service.ts:16-24` — only `log`/`error` are published; every `warn` never reaches Mongo. `http-logging.interceptor.ts:70-71` logs all 4xx at error level.
- `backend/src/libs/messaging/messaging.module.ts:36` — unknown client tokens silently fall back to `QUEUE.log`.
- `log-service/schemas/log.schema.ts:24,30-31` — the TTL index and a separate `{timestamp:-1}` index are redundant; unused `timestamps: true`; `logs.service.ts:23-26` swallows write errors.
- `notification-service/email/email.service.ts:14-18` — no `secure`/`requireTLS`, no `transporter.verify()` at startup; `email.channel.ts:18,34` reads an unused `FRONTEND_URL` whose default is the gateway port; `notifications.controller.ts:72` reads `process.env` directly.
- `analytics.controller.ts:48` hard-codes `userName: null` and order-service always sends `userEmail: null` (`orders.service.ts:154`), so those `order_facts` columns are always empty; month boundaries depend on the Node process time zone and `EXTRACT` can't use the index.
- `backend/src/apps/api-gateway/main.ts:44` — `bootstrap().catch(console.error)` exits 0 on startup failure and bypasses the logger.
- `promocode-service/promocode.controller.ts:47-50` — `findByCode` returns the raw entity (incl. `deletedAt`) instead of a response DTO.

### Backend — contracts, dead code, duplication
- `RPC.order.findByUserId` has no caller (the admin route reuses `RPC.order.findMine`, `order.client.ts:26`); `RPC.promocode.findByCode` has no caller.
- Unused: `DiscountValue` (`contracts/discount-mode.constant.ts:10`), `LocalImageStorage.urlPathFor` (controllers rebuild the path by hand at `users.controller.ts:110`, `pizzas.controller.ts:104`), `orders.repository.ts:33-41 findByUserId`, `order-items.repository.ts:18,26,32`.
- `OrderStatusChangedEvent.status/previousStatus` typed `string` instead of `OrderStatus` (`contracts/events.types.ts:64-65`).
- `cart-service/carts.service.ts`: `Math.max(0, …)` at :148 is redundant with the schema; `clearForOrder` (:203-205) just aliases `clearCart`; explicit item delete at :214 duplicates the cascade. `users.service.ts:68-78` — `setEmailVerified` and `updateVerificationStatus` overlap.
- Pagination ownership is inconsistent: `CatalogClient.findAll`/`OrderClient.findAll` build `PaginatedResponseDto` in the gateway, while `IdentityClient.findAll`/`OrderClient.findByUserId` expect the service to.
- Nits: `LogClient` lives in `analytics.client.ts`; `IdentityClient.getProfile` duplicates `findById`; split duplicate import at `auth.controller.ts:23-24`; unused `JwtModule.signOptions` in the gateway; `libs/database/database.types.ts` `DeepPartial` duplicates TypeORM's.

### Swagger
- `PaginatedResponseDto.data` is `@ApiProperty()` on generic `T[]`, so every paginated response renders an untyped `data`.
- Missing return types / response `type`: `carts.controller.ts:81` (`addItem`), `analytics.controller.ts:27,34`, `logs.controller.ts:24`. `GET /ingredients` requires auth but documents no 401.

### Frontend
- `frontend/src/stores/auth.ts:37-41` — a failed first session restore (network/5xx) is cached until a full reload; the user is treated as a guest.
- `frontend/src/components/base/BaseConfirmDialog.vue:34-46`, `composables/useConfirmDanger.ts:37-38` — Escape/mask closes the dialog while `onConfirm` is pending (also firing `onCancel`); nested `role="alertdialog"` without `aria-labelledby/describedby`.
- `frontend/src/views/CheckoutView.vue:130-135` + `layouts/CustomerLayout.vue:33-37` — two identical verification banners on a 403.
- `frontend/src/composables/usePersonalInfoForm.ts:55-64` — unsaved profile edits are wiped whenever the user object refreshes.
- `frontend/src/views/admin/AdminPromocodesView.vue:102-104` — `isToggling` tracks only the latest mutation; `composables/usePromocodes.ts:96-100` restore-then-update leaves the code active if the update fails.
- `frontend/src/components/layout/AppHeader.vue:138`, `AdminSidebarUser.vue:31` — raw `user.image` instead of `toMediaUrl(...)`; breaks with a cross-origin `VITE_API_BASE_URL`.
- Accessibility: `PizzaIngredientsCard.vue:98` always references a possibly-absent `new-ingredient-error`; `PersonalInfoForm.vue:88-93` gender error not linked; `PizzaCard.vue:69` aria-label contradicts visible text (WCAG 2.5.3); error toasts vanish after 3 s (`utils/constants/ui.constants.ts:3`).
- Dead code: ungrouped `<ConfirmDialog />` in `App.vue:29`; `status`, `initials`, `displayName` in `stores/auth.ts:15,20-21` used only in tests; `services/api/orders.ts:26 getOrder`; unused props on `AdminTable.vue` (`emptyTitle`, `emptyDescription`, `emptyIcon`, `skeletonRows`) and `BaseSelect.vue` (`showClear`).
- Duplication: `MyOrdersView.vue:19-29` re-implements `utils/route-query`; display-name logic repeated in `AdminSidebarUser.vue:18-21`, `ProfileHeaderCard.vue:15-17`, `BaseAvatar.vue:38-41` instead of `getUserDisplayName`; `ProfileView.vue:35-56` and `AdminProfileView.vue:22-43` share identical handlers; "Pick up" vs "Pickup" labels (`OrderDeliveryDetailsCard.vue:25-26`, `DeliveryMethodPicker.vue:12` vs `order.constants.ts:76`); `useMenuFilters` reused as a generic search/paging composable for admin pages.
- `frontend/vite.config.ts:10` — leftover scaffold comment.

### Tests
- Frontend: `AdminPizzasView.spec.ts › opens the add and edit pages` is flaky (fails in the full run, passes alone). No specs for `useChangePasswordForm`, `useServerFormErrors`, `useOrderDetails`, `useCreateOrder`, `useMenuFilters`, `PizzaOrderPanel`; the ProfileView test uses an 8+ char password so H-7 is never exercised. `vitest.config.ts` has no coverage thresholds.
- Backend: `libs/price-calculation` has no own spec; no test asserts every non-public route has `@Can`; auth cookie options aren't asserted; `NotificationsMessagesController` and `EmailService` have no specs; `notifications.service.spec.ts:73` uses `.resolves.not.toThrow()` which can't catch the intended failure; `critical-error.filter.spec.ts` lives under `notification-service/tests` but tests `libs/logging`; `cart.service.spec.ts` leans on bare `toHaveBeenCalled()`; analytics raw SQL lives in `*.repository.ts`, excluded from coverage and untested; "DLQ" tests only assert `nack`.
- `backend/test/app.e2e-spec.ts:65-73,102-109,118-128` — assertions are "status is not 401/403", so they pass on 500/504; they only exercise guards.

### CI, Docker, tooling, docs
- `.github/workflows/ci.yml` — the e2e job has no RabbitMQ service; every job re-runs `npm ci` and `needs: build` doesn't reuse build output; actions pinned to tags, not SHAs; no Docker build or `npm audit`; triggering on `.github/workflows/**` means editing `frontend-ci.yml` runs backend CI. `frontend-ci.yml` is still untracked, so frontend CI isn't active yet.
- `backend/docker-compose.yaml:59,76` — `mongo:latest` (a major bump can make the volume unreadable) and unmaintained `mailhog/mailhog:latest`; all 9 services build the same image separately instead of building once and reusing an `image:` tag.
- `.claude/hooks/post-edit-check.mjs:16,20` — lints without `--max-warnings=0` (warnings like `no-floating-promises`, set to `warn` in `eslint.config.mjs:30`, pass locally but fail CI); runs the full lint and test suite after every edit, even for `.md`/`.yaml`; `--fix` rewrites files behind the editor.
- `backend/package.json:16` — `test:debug` uses CommonJS `ts-node/register` without `--experimental-vm-modules`, so it can't work under ESM (and breaks on Windows).
- Docs drift:
  - `backend/README.md:65` says Node 20+, but `--env-file-if-exists` (`package.json:18`) needs Node ≥ 22.9.
  - The README (lines 34-40, 181-186) describes features that don't exist: password reset, crusts/sizes/stock, order-status emails.
  - It also mentions `RABBITMQ_PATTERNS`, `RolesGuard`/`@Roles` and Mongoose helpers in `libs/database`, none of which exist, and links a missing `LICENSE`.
  - `CLAUDE.md` claims the README's `/api/docs` is wrong, but the README already says `/api-docs`. `CLAUDE.md` also omits the `safety-check.js` hook.
  - `frontend/README.md:86-97` references a non-existent `unit/stores/cart.spec.ts` and omits most test folders.

---

## What's done well
- **Thin gateway, consistent contracts.** Every controller only validates and delegates. Patterns and events are constants. The user id always comes from the JWT via `@CurrentUser()`, which rules out IDOR on cart, order and profile routes. Ownership is checked server-side (`findMyOrderById`, `setRole` with `actingUserId`), and update DTOs cannot touch `role`.
- **Auth fundamentals.** JWT claims are Zod-validated after signature verification. `@Can` covers every admin route. The frontend uses an httpOnly cookie only (no localStorage tokens) and guards against open redirects (`getSafeRedirect`).
- **Messaging plumbing.** The tagged `__rpc` error envelope maps cleanly to HTTP, timeouts become 504, and internal messages don't leak. `RpcAckInterceptor` acks on both success and error. Every `@EventPattern` goes through `ack()` with no requeue loops. Analytics writes are idempotent upserts.
- **Money and promocodes.** Pricing is centralised in `libs/price-calculation` with cent rounding and clamped discounts. Checkout re-resolves prices from catalog instead of trusting the cart. Promocode reservation is an atomic `INSERT … ON CONFLICT DO NOTHING RETURNING *` on a unique `(userId, promocodeId)`. Pizza create/update with ingredients is transactional, and `markOrdered` is monotonic.
- **Frontend quality.** It uses `strictTypeChecked` with `noUncheckedIndexedAccess`, and has no `any`, non-null assertions, `v-html` or Options API. Query keys are centralised. Cart updates are optimistic with rollback. Server field errors are mapped centrally onto inputs. Components are small, and the accessibility baseline is solid.
- **Path safety and CI hygiene.** Path traversal is guarded in `LocalImageStorage`, upload names are server-generated UUIDs, and Mongo logs have a TTL. CI uses least-privilege permissions, concurrency cancellation, `--max-warnings=0` and enforced backend coverage thresholds.
