# Testing Skill

## Purpose
Write and maintain unit tests for the PizzaHot NestJS microservices monorepo, following the patterns established in the existing test suite.

---

## Test Setup Rules

### File Location
- Unit tests live in a `tests/` subfolder inside the app directory, e.g.:
  ```
  backend/src/apps/catalog-service/tests/pizzas.service.spec.ts
  backend/src/apps/identity-service/tests/users.service.spec.ts
  ```
- E2E tests live in `backend/test/` with a separate `jest-e2e.json` config

### Imports — Always explicit
```ts
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
```
Never rely on Jest globals being injected automatically — this project uses ESM mode where they must be imported explicitly.

### No NestJS Testing Module
Services are instantiated directly with `new ServiceName(dep1, dep2, ...)`. Do **not** use `Test.createTestingModule()` in unit tests — it is slower and couples tests to the DI container.

---

## Mocking Pattern

### Repository mocks — fully typed
```ts
type Repo = { [K in keyof IFooRepository]: jest.Mock<IFooRepository[K]> };

let repository: Repo;

beforeEach(() => {
  repository = {
    findById: jest.fn<IFooRepository["findById"]>(),
    findAll:  jest.fn<IFooRepository["findAll"]>(),
    create:   jest.fn<IFooRepository["create"]>(),
    save:     jest.fn<IFooRepository["save"]>(),
    update:   jest.fn<IFooRepository["update"]>(),
    remove:   jest.fn<IFooRepository["remove"]>(),
  };
});
```

### ClientProxy (RabbitMQ events) mock
```ts
let events: { emit: jest.Mock<(pattern: string, data: unknown) => unknown> };

beforeEach(() => {
  events = { emit: jest.fn() };
});

events as unknown as ClientProxy
```

### IImageStorage mock
```ts
let images: { [K in keyof IImageStorage]: jest.Mock<IImageStorage[K]> };

beforeEach(() => {
  images = {
    urlPathFor: jest.fn<IImageStorage["urlPathFor"]>(),
    remove:     jest.fn<IImageStorage["remove"]>().mockResolvedValue(true),
  };
});
```

### Generic "any async mock" helper (useful for controller tests)
```ts
type AnyMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;

function anyMock(value: unknown = undefined): AnyMock {
  return jest.fn<(...args: unknown[]) => Promise<unknown>>().mockResolvedValue(value);
}
```

### Entity builder helper
Always define a small builder function to avoid repetition:
```ts
function pizza(overrides: Partial<Pizza> = {}): Pizza {
  return {
    id: "p1",
    name: "Margherita",
    description: "Classic",
    price: 8.5,
    image: null,
    pizzaIngredients: [],
    lastOrderedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}
```

---

## What to Test

### Services (highest priority — 90% coverage required)

Cover every public method. For each method, test:

| Scenario | Assertion |
|---|---|
| Happy path | Result shape matches expected DTO/entity |
| Not found | Throws `NotFoundException` with correct message |
| Conflict (duplicate name/email) | Throws `ConflictException` before any write |
| Invalid input (bad IDs, etc.) | Throws before touching DB |
| Event emission on success | `events.emit` called with correct `EVENTS.*` constant and payload shape |
| No event on failure | `events.emit` **not** called when operation throws |
| Image cleanup on entity not found | `images.remove` called with the orphaned path |
| Missing image file raises `EVENTS.criticalError` | `events.emit` called with `{ errorType: "..." }` |
| Repository failure → 500 | Throws `InternalServerErrorException` |

### Controllers (RabbitMQ message handlers)

Controllers are thin — test that they:
1. **Unwrap** the incoming payload and pass the right arguments to the service
2. **Return** the correct shape (often `{ ok: true }` for void operations)
3. **Emit** the correct event for side-effecting operations (e.g. `EVENTS.pizzaDeleted`)
4. **ACK / NACK** the RabbitMQ message correctly for event listeners (manual-ack patterns)

### Repositories (lower priority — excluded from coverage by default)

Only test repositories if they contain non-trivial query logic that is not expressible through the TypeORM/Mongoose API trivially.

---

## Assertion Patterns

```ts
// Positive result
expect(result).toMatchObject({ id: "p1", name: "Margherita" });
// (prefer toMatchObject over toEqual — more resilient to extra fields)

// Exception type
await expect(service.remove("nope")).rejects.toThrow(NotFoundException);

// Exception message (when exact message matters)
await expect(service.remove("nope")).rejects.toThrow(
  new NotFoundException("Pizza not found")
);

// Event was emitted with correct pattern and partial payload
expect(events.emit).toHaveBeenCalledWith(
  EVENTS.pizzaCreated,
  expect.objectContaining({ pizzaId: "p1", name: "Margherita" })
);

// Method was NOT called (e.g. no write on validation failure)
expect(repository.createWithIngredients).not.toHaveBeenCalled();
expect(events.emit).not.toHaveBeenCalled();

// Called with specific args
expect(repository.update).toHaveBeenCalledWith("p1", { image: "/uploads/pizzas/new.png" });
```

---

## RmqContext ACK/NACK pattern (event listeners)

```ts
const channelAndContext = () => {
  const channel = { ack: jest.fn(), nack: jest.fn() };
  return {
    channel,
    context: {
      getChannelRef: () => channel,
      getMessage: () => ({}),
    } as unknown as RmqContext,
  };
};

it("acks on success", async () => {
  const { context, channel } = channelAndContext();
  await controller.onOrderCreated(event, context);
  expect(channel.ack).toHaveBeenCalled();
});

it("nacks to DLQ on failure", async () => {
  repository.markOrdered.mockRejectedValue(new Error("db down"));
  const { context, channel } = channelAndContext();
  await controller.onOrderCreated(event, context);
  expect(channel.nack).toHaveBeenCalledWith({}, false, false);
});
```

---

## Coverage Thresholds

Configured in `backend/package.json` — failing these blocks CI:

| Metric | Threshold |
|---|---|
| Statements | 90% |
| Lines | 90% |
| Functions | 85% |
| Branches | 73% |

Files excluded from coverage: `*.spec.ts`, `main.ts`, `*.module.ts`, `*.entity.ts`, `*.types.ts`, `*.constant.ts`, `data-source.ts`, `migrate.ts`, `typeorm.config.ts`, `*.repository.ts`, `dto/**` (except `*-response.dto.ts`).

Run coverage (from `backend/`) with:
```bash
cd backend
npm run test:cov
```

---

## Running Tests

All commands run from the `backend/` directory.

```bash
cd backend

# All unit tests
npm test

# Watch mode during development
npm run test:watch

# Single file
npm test -- --testPathPattern="pizzas.service"

# E2E tests
npm run test:e2e
```

> **Note:** The project uses `--experimental-vm-modules` for ESM support. Always use the `npm run test*` scripts — do not invoke `jest` directly.
