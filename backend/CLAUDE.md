# PizzaHot — Project Guide for AI Assistants

## Project Overview

**PizzaHot** is a NestJS-based **microservices monorepo** (NestJS monorepo mode) for a pizza ordering platform. All services share a single codebase, are built from a common Dockerfile, and communicate exclusively via **RabbitMQ** (RPC + events). There is no direct HTTP communication between services.

---

## Architecture

```
src/
├── apps/                   # Individual microservices (each has its own main.ts)
│   ├── api-gateway         # Single public HTTP entry point (port 3000)
│   ├── identity-service    # Auth + user management (PostgreSQL + TypeORM)
│   ├── catalog-service     # Pizzas & ingredients (PostgreSQL + TypeORM)
│   ├── cart-service        # Shopping cart (PostgreSQL + TypeORM)
│   ├── order-service       # Orders + status workflow (PostgreSQL + TypeORM)
│   ├── promocode-service   # Promo codes (PostgreSQL + TypeORM)
│   ├── analytics-service   # Reports & stats (PostgreSQL + TypeORM)
│   ├── notification-service # Email via nodemailer/mailhog (no DB)
│   └── log-service         # Structured logging (MongoDB + Mongoose)
└── libs/                   # Shared libraries imported by all apps
    ├── auth                # JWT guard + permissions guard
    ├── contracts           # Shared RPC patterns, event names, TypeScript interfaces
    ├── database            # TypeORM + Mongoose config helpers
    ├── logging             # RmqLoggerService, HttpLoggingInterceptor, CriticalErrorFilter
    ├── messaging           # MessagingModule — wraps ClientsModule for RabbitMQ
    ├── mocks               # Jest mocks shared across tests
    ├── pagination          # Shared pagination DTOs/utilities
    ├── price-calculation   # Discount/price calculation logic
    ├── swagger             # Swagger decorator helpers
    ├── upload              # Multer file upload helpers
    └── validation          # Zod-based validation pipe
```

### Communication Flow

```
HTTP Client → api-gateway (REST) → RabbitMQ (RPC/events) → Microservices
```

- The **api-gateway** exposes all REST endpoints and proxies calls to downstream services via RabbitMQ RPC.
- Services emit **fire-and-forget events** for cross-cutting concerns (notifications, analytics, logging).
- All message patterns and event names are defined in `src/libs/contracts/patterns.constant.ts`.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js 22, TypeScript 5, ESM |
| Framework | NestJS 11 |
| HTTP transport | `@nestjs/platform-express` |
| Messaging | RabbitMQ via `@nestjs/microservices` + `amqp-connection-manager` |
| Primary DB | PostgreSQL 17 (via TypeORM 0.3) |
| Secondary DB | MongoDB (via Mongoose 9, log-service only) |
| Auth | JWT (`@nestjs/jwt`), HTTP-only cookie |
| Validation | Zod 4 (custom `ZodValidationPipe`) |
| Hashing | bcrypt |
| Email | nodemailer (MailHog in dev) |
| API docs | Swagger (`@nestjs/swagger`) at `/api-docs` |
| Rate limiting | `@nestjs/throttler` (100 req / 60 s per IP) |
| Testing | Jest 30 + ts-jest + Supertest |
| Containerisation | Docker + Docker Compose |
| Linting/Formatting | ESLint 9 + Prettier 3 |

---

## Key Commands

```bash
# Development — run a specific app locally
nest start api-gateway --watch
nest start identity-service --watch
# (replace with any app name from src/apps/)

# Build all apps for production
npm run build

# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Lint & fix
npm run lint

# Format
npm run format

# Database migrations (identity-service)
npm run migration:run
npm run migration:revert

# Docker — start the full stack
docker compose up --build

# Docker — start infrastructure only (for local dev)
docker compose up rabbitmq pgdb mongodb mailhog
```

---

## Environment Variables

Copy `.env.example` → `.env` and fill in values. Key variables:

| Variable | Description |
|---|---|
| `PORT` | Gateway HTTP port (default `3000`) |
| `NODE_ENV` | `development` / `production` |
| `POSTGRES_*` | PostgreSQL credentials & DB name |
| `MONGO_*` | MongoDB credentials & DB name |
| `RABBITMQ_URL` | Full AMQP URL (e.g. `amqp://guest:guest@localhost:5672`) |
| `RPC_TIMEOUT_MS` | Gateway → service RPC timeout in ms (default `10000`) |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRATION` | JWT expiry string (e.g. `1d`) |
| `SMTP_*` | Nodemailer SMTP config (MailHog defaults work locally) |
| `FRONTEND_URL` / `BACKEND_URL` | Used in email templates |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin user credentials |

---

## Coding Conventions

### TypeScript / ESM
- The project uses **native ESM** (`"type": "module"` in `package.json`). All imports must include the `.ts` extension (e.g. `import { Foo } from './foo.ts'`).
- Avoid `require()`. Use ESM `import/export` everywhere.

### NestJS Patterns
- **Modules** follow NestJS DI conventions. Always register providers, not instantiate manually.
- **Controllers** in `api-gateway` act as thin proxies — they validate input and forward to a *Client* service (`*.client.ts`).
- **Client files** (`src/apps/api-gateway/clients/*.client.ts`) wrap RabbitMQ `send()` / `emit()` calls and handle timeouts.
- **Domain logic** belongs inside the respective microservice, never in the gateway.
- Guard application order matters: `ThrottlerGuard` → `JwtAuthGuard` → `PermissionsGuard`.

### Validation
- Use `ZodValidationPipe` from `libs/validation` for request DTOs. Define schemas with Zod 4.
- DTOs are located inside each app's feature folder (e.g. `src/apps/catalog-service/pizzas/dto/`).

### Contracts Library (`src/libs/contracts`)
- **Never hardcode message patterns as strings.** Always use constants from `patterns.constant.ts`:
  ```ts
  import { RPC, EVENTS } from '../../libs/contracts/index.ts';
  // RPC.catalog.pizzaList, EVENTS.orderCreated, etc.
  ```
- **Event payload interfaces** live in `events.types.ts`. Add new ones there.

### Database
- **PostgreSQL services** define a `data-source.ts` (TypeORM DataSource) and a `migrations/` folder.
- Run migrations with `npm run migration:run` (builds first, then runs `dist/apps/identity-service/migrate.js`).
- **MongoDB** is used exclusively by `log-service` via Mongoose schemas.

### Logging
- Use `RmqLoggerService` (implements NestJS `LoggerService`) — it forwards logs to `log-service` via RabbitMQ events.
- The gateway bootstraps the logger via `app.useLogger(app.get(RmqLoggerService))`.
- Critical errors are captured by `CriticalErrorFilter` and emitted as `EVENTS.criticalError` events.

### File Uploads
- Multer is configured in `libs/upload`. Uploaded files go to `./uploads/` and are served statically at `/uploads/*` by the gateway.

### Testing
- Unit tests live alongside source files as `*.spec.ts`.
- E2E tests live in `test/` and use a separate `jest-e2e.json` config.
- Coverage thresholds: **90% statements, 85% functions, 90% lines, 73% branches**.
- Shared mocks are in `src/libs/mocks/`.

---

## Adding a New Feature (Checklist)

1. **Define message patterns** in `src/libs/contracts/patterns.constant.ts` (RPC or EVENTS).
2. **Add payload interfaces** to `src/libs/contracts/events.types.ts` if needed.
3. **Implement in the owning microservice**: entity → repository → service → controller handler.
4. **Expose via gateway**: add a method to the relevant `*.client.ts`, then call it from the relevant `controllers/*.controller.ts`.
5. **Add Swagger decorators** using helpers from `libs/swagger`.
6. **Write unit tests** (`*.spec.ts`) and maintain coverage thresholds.

---

## Docker Compose Services

| Container | Image / App | Ports |
|---|---|---|
| `pizzahot-rabbitmq` | `rabbitmq:4-management-alpine` | `5672`, `15672` (management UI) |
| `pizzahot-pgdb` | `postgres:17` | `5432` |
| `pizzahot-mongodb` | `mongo:latest` | `27018` |
| `pizzahot-mailhog` | `mailhog/mailhog` | `1025` (SMTP), `8025` (Web UI) |
| `pizzahot-gateway` | `api-gateway` build | `3000` |
| `pizzahot-identity` | `identity-service` build | — |
| `pizzahot-catalog` | `catalog-service` build | — |
| `pizzahot-cart` | `cart-service` build | — |
| `pizzahot-order` | `order-service` build | — |
| `pizzahot-promocode` | `promocode-service` build | — |
| `pizzahot-analytics` | `analytics-service` build | — |
| `pizzahot-notification` | `notification-service` build | — |
| `pizzahot-log` | `log-service` build | — |

All app containers are built from a single **multi-stage Dockerfile** parameterised by the `APP_NAME` build arg.

---

## Useful URLs (local dev)

| URL | Description |
|---|---|
| `http://localhost:3000/api-docs` | Swagger UI |
| `http://localhost:15672` | RabbitMQ Management UI |
| `http://localhost:8025` | MailHog web interface |
