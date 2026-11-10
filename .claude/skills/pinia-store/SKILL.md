---
name: pinia-store
description: Create or change a Pinia store in the PizzaHot frontend (frontend/src/stores) using the setup-store syntax only — never options stores. Use when adding global client state shared across routes (cart, auth user, UI preferences), deciding whether state belongs in Pinia, a composable, vue-query or a local ref, or consuming a store from a view (storeToRefs).
---

# Pinia Store Skill

Paths are relative to `frontend/`. Follow the no-unnecessary-comments rule in `CLAUDE.md`. For components, see the `vue-component` skill.

## 1. Does it belong in Pinia?

| State | Where |
|---|---|
| Server data (menus, orders, profiles from the API) | vue-query (`useQuery`/`useMutation`) in a composable — **never** mirrored into a store |
| Global client state shared across routes (cart, auth user, theme) | **Pinia store** |
| Reusable logic without global scope (pagination, search, form rules) | Composable `use<Name>()` |
| One component's UI state | Local `ref` |

## 2. Location & naming

- File `src/stores/<domain>.ts` (`cart.ts`), export `use<Domain>Store`, id = domain (`"cart"`). One domain per store; types in `src/types/<domain>.ts`.

## 3. Setup-store skeleton

```ts
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";

import type { CartItem } from "@/types/cart";

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));

  function add(pizzaId: string): void {
    const existing = items.value.find((item) => item.pizzaId === pizzaId);
    if (existing) existing.quantity++;
    else items.value.push({ pizzaId, quantity: 1 });
  }

  function reset(): void {
    items.value = [];
  }

  return { items, itemCount, add, reset };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
```

- **Banned:** options stores (`state: () => ({})`, `getters: {}`, `actions: {}`), `this`, `mapState`/`mapActions`/`mapStores`.
- `ref` = state, `computed` = getters, functions = actions. Return **every** piece of state, otherwise devtools, HMR and plugins miss it.
- Explicit return types; async actions return `Promise<T>` and let errors propagate. `$reset()` doesn't work in setup stores — expose `reset()`.
- Mutate state only through intent-named actions (`add`, `applyPromocode`). Other stores may be used inside actions; avoid cycles.
- No server-data fetching in stores; API calls only for client-owned flows (e.g. login storing the user).

## 4. Using a store

```ts
const cart = useCartStore();
const { items, itemCount } = storeToRefs(cart);
cart.add(pizzaId);
```

- Destructure state/getters with `storeToRefs()` (plain destructuring loses reactivity); call actions on the store.
- Use stores in **views** and composables only; base/feature components stay dumb (props in, emits out). `v-model` on store state only via a `computed` getter/setter calling an action.

**Done when:** `npm run lint:fix` and `npm run type-check` pass.
