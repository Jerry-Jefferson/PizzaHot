# Code Review Skill

## Purpose
Perform a thorough code review of a file or a set of changes in the PizzaHot NestJS microservices monorepo, checking for correctness, architecture adherence, and project-specific conventions.

---

## Review Checklist

### 1. ESM Imports
- [ ] Every import ends with the `.ts` extension — e.g. `import { Foo } from './foo.ts'`
- [ ] No `require()` calls anywhere — only ESM `import`/`export`
- [ ] Path aliases are used correctly (relative paths starting with `../../libs/...`)

### 2. Contracts Library
- [ ] RPC message patterns are referenced from `RPC` constant in `libs/contracts/patterns.constant.ts` — **no hardcoded strings**
- [ ] Event names are referenced from `EVENTS` constant — **no hardcoded strings**
- [ ] New event payload shapes are added to `libs/contracts/events.types.ts`, not defined inline

### 3. Service Layer (microservices under `backend/src/apps/`)
- [ ] Domain logic lives in the service, **not** in the controller or repository
- [ ] The service throws the appropriate NestJS HTTP exception (`NotFoundException`, `ConflictException`, `BadRequestException`, `UnauthorizedException`, `InternalServerErrorException`) — never raw `Error`
- [ ] `Logger` is instantiated as `private readonly logger = new Logger(ServiceName.name)` — never uses `console.log`
- [ ] Event emission is wrapped in `try/catch` so a broken RabbitMQ connection doesn't kill the main operation
- [ ] `CriticalErrorEvent` is emitted via `EVENTS.criticalError` for unrecoverable anomalies (e.g. missing files, broken invariants)
- [ ] Image/file cleanup happens **before** the DB change when entity is not found (to avoid orphaned uploads)

### 4. Gateway Layer (`backend/src/apps/api-gateway/`)
- [ ] Controllers are thin proxies — they only validate input and delegate to `*.client.ts`
- [ ] Client files (`clients/*.client.ts`) contain all RabbitMQ `send()` / `emit()` logic
- [ ] No domain logic lives in the gateway
- [ ] Guards are applied via module-level providers, not per-controller decorators (unless intentionally overriding)
- [ ] Guard order is preserved: `ThrottlerGuard` → `JwtAuthGuard` → `PermissionsGuard`

### 5. Messaging
- [ ] RPC calls use `send()` and return an `Observable` / are piped with `firstValueFrom`
- [ ] Fire-and-forget events use `emit()` (no return value expected)
- [ ] The `RPC_TIMEOUT_MS` environment variable is respected for RPC timeout configuration

### 6. Database
- [ ] PostgreSQL services use TypeORM entities and the repository pattern (interface `I*Repository`)
- [ ] The repository interface (`*.types.ts`) is what the service depends on — not the concrete class
- [ ] MongoDB is used **only** in `log-service` via Mongoose schemas
- [ ] Migrations are added for any schema change in PostgreSQL services

### 7. Validation
- [ ] Request DTOs are validated with `ZodValidationPipe` from `libs/validation`
- [ ] Zod schemas are defined in `dto/` alongside the DTO class
- [ ] No manual `if` checks for input shape inside services — validation is the pipe's job

### 8. Pagination
- [ ] List endpoints return `PaginatedResult<T>` from `libs/pagination/pagination.types.ts`
- [ ] Page/limit parameters are forwarded to `findPaginated()` on the repository

### 9. File Uploads
- [ ] Multer config is imported from `libs/upload` — not configured inline
- [ ] Uploaded files are served from the `./uploads/` directory via the gateway's static middleware
- [ ] Old files are cleaned up when replaced (`images.remove(existingPath)`)
- [ ] A `CriticalErrorEvent` is emitted if the old file was already missing when it was supposed to be replaced or deleted

### 10. Auth & Permissions
- [ ] Public endpoints are decorated with `@Public()` from `libs/auth`
- [ ] Role-restricted endpoints use `@Permissions(Role.ADMIN)` (or the appropriate role)
- [ ] `actingUserId` is extracted from the JWT payload via the request context — never trusted from the request body

### 11. Swagger
- [ ] All gateway controller methods have `@ApiOperation`, `@ApiResponse` (or equivalent) decorators
- [ ] Response DTOs are used (not raw entities) so Swagger reflects what clients actually receive
- [ ] Bearer auth is declared on secured endpoints

### 12. General TypeScript
- [ ] No `any` — use proper types or `unknown` with narrowing
- [ ] `as unknown as X` casts are acceptable only in tests, not in production code
- [ ] `Number()` coercion is used when a DB value may come back as a string (e.g. `Number(pizza.price)`)

---

## How to Use This Skill

When asked to review code, work through the checklist top-to-bottom. For each failed item, cite the exact file + line and explain:
1. What the problem is
2. Why it matters in this project
3. The correct fix

Group findings by severity: **🔴 Critical** (bugs, data loss risk), **🟡 Warning** (convention violations, maintainability), **🟢 Suggestion** (style, optional improvements).
