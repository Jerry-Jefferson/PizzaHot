---
name: frontend-tests
description: How to write Vitest unit tests for the PizzaHot frontend (frontend/src) - where the spec goes, mocking the API modules, testing Pinia setup stores with a real Pinia, composables using vue-query, mounting components and views with PrimeVue, Pinia and vue-router, PrimeVue overlays, Vuelidate forms, fake timers. Use when adding or changing tests in frontend/tests/unit, or after changing code in frontend/src.
---

# Writing frontend unit tests (Vitest)

Run from `frontend/`: `npm test` (all), `npx vitest run <path>` (one file), `npx vitest run -t "<name>"` (one test), `npm run test:cov` (coverage).
Setup: jsdom, **no globals** (import `describe`/`it`/`expect`/`vi`/`beforeEach` from `vitest`), no setup file, `@/` alias from `vite.config.ts`.

## Where the spec goes

- `tests/unit/` mirrors `src/`: `src/stores/cart.ts` → `tests/unit/stores/cart.spec.ts`, `src/components/pizza/PizzaCard.vue` → `tests/unit/components/pizza/PizzaCard.spec.ts`, `src/router/index.ts` → `tests/unit/router/index.spec.ts`.
- Never under `src/` — only `tests/unit/**/*.spec.ts` is collected, type-checked (`tsconfig.vitest.json`) and linted with the Vitest rules.
- One spec per source file. Import everything via `@/`; `vi.mock` the exact `@/…` specifier the code imports. Explicit return types aren't required in specs.

## Mock at the API boundary

Mock the API modules (`@/api/<domain>`), never `fetch`. Keep stores, composables and components real.

```ts
import * as pizzasApi from "@/api/pizzas";

vi.mock("@/api/pizzas", () => ({ fetchPizzas: vi.fn(), fetchPizza: vi.fn() }));

beforeEach(() => vi.mocked(pizzasApi.fetchPizza).mockReset());
vi.mocked(pizzasApi.fetchPizza).mockResolvedValue(PIZZA);
vi.mocked(pizzasApi.fetchPizza).mockRejectedValue(new Error("Pizza not found"));
```

- Views only: mock data composables (`vi.mock("@/composables/usePizzas", ...)`) returning `ref`s when the view test isn't about fetching.

## Pinia stores

Real Pinia, fresh per test; drive the store only through actions and assert state/getters.

```ts
beforeEach(() => setActivePinia(createPinia()));

it("increments quantity for a repeated pizza", () => {
  const cart = useCartStore();
  cart.add("p1");
  cart.add("p1");
  expect(cart.itemCount).toBe(2);
});

it("re-throws API errors", async () => {
  vi.mocked(authApi.login).mockRejectedValue(error);
  await expect(useAuthStore().login(CREDENTIALS)).rejects.toBe(error);
});
```

Cover: success, error (state unchanged and re-thrown), loading flags reset, `reset()`.

## Composables with vue-query

Mount a tiny host component with a fresh `QueryClient` (`retry: false`) per test, API mocked:

```ts
function withQuery<T>(composable: () => T): T {
  let result!: T;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mount(defineComponent({ setup: () => ((result = composable()), () => null) }), {
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  });
  return result;
}

const { data } = withQuery(() => usePizzas("marg"));
await flushPromises();
expect(data.value).toEqual([PIZZA]);
```

## Components and views

```ts
async function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/menu", name: "menu", component: PizzaMenuView }],
  });
  await router.push("/menu");
  const wrapper = mount(PizzaMenuView, { global: { plugins: [createPinia(), router, PrimeVue] } });
  await flushPromises();
  return { wrapper, router };
}
```

- Dumb components: `mount(Comp, { props, global: { plugins: [PrimeVue] } })` — no Pinia or router unless they use them.
- Assert props in → `wrapper.emitted("addToCart")` out; find by role, text, `aria-*` or `data-test`, not PrimeVue internal classes (`.p-button`).
- Overlays (`Dialog`, `Select`, `Popover`, `Toast`) teleport to `document.body`: mount with `attachTo: document.body`, query `document.body`, `wrapper.unmount()` in `afterEach`.
- Vuelidate forms: `setValue()` the inputs, `trigger("submit")`, `await flushPromises()`, then assert the error messages.
- After clicks, route changes and async actions: `await flushPromises()`.
- Timers / debounced search: `vi.useFakeTimers()`, `vi.advanceTimersByTime(ms)`, `vi.useRealTimers()` in `afterEach`.

## Style

- Test names describe behaviour (`"shows an error for an invalid email"`); table cases with `it.each`.
- Small factories at the top (`const pizza = (overrides: Partial<Pizza> = {}): Pizza => ({ ... })`).
- Prettier: double quotes, semicolons, width 100. Finish with `npm test`, `npm run lint`, `npm run type-check`.
