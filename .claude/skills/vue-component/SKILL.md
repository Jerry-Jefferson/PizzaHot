---
name: vue-component
description: Create a new Vue 3 component in the PizzaHot frontend (frontend/src) with <script setup lang="ts"> and the Composition API only — never the Options API. Use when adding a view, a reusable base/UI or feature component, a composable (use...) or a Pinia store. Covers naming and location, typed defineProps/defineEmits, dumb presentational components, composables vs. Pinia vs. vue-query, PrimeVue + Tailwind token styling, and useRouter/useRoute.
---

# Vue Component Skill

Paths are relative to `frontend/`. Follow the no-unnecessary-comments rule in `CLAUDE.md`.

**Banned:** Options API — `export default {}`, `defineComponent({...})`, `data()`, `methods`, `computed: {}`, `watch: {}`, lifecycle options, `this`, options-style Pinia stores. Use `ref`, `computed()`, `watch()`, `onMounted()` from `vue` inside `<script setup lang="ts">`.

## 1. Location & naming

| Kind | Path | Example |
|---|---|---|
| View (route page, the "ViewModel") | `src/views/<Name>View.vue` | `PizzaMenuView.vue` |
| Base component (app-agnostic, dumb) | `src/components/base/Base<Name>.vue` | `BaseCard.vue` |
| Feature component (domain-shaped, dumb) | `src/components/<feature>/<Name>.vue` | `pizza/PizzaCard.vue` |
| Composable / store / types | `src/composables/use<Name>.ts`, `src/stores/<domain>.ts`, `src/types/<domain>.ts` | `usePizzas.ts`, `cart.ts` |

- PascalCase, always multi-word. Import via `@/`. Register views in `src/router/index.ts` with a `name`.
- Only views touch the router, stores, composables and APIs; everything below receives props.

## 2. `<script setup>` skeleton

```vue
<script setup lang="ts">
import Button from "primevue/button";
import { computed } from "vue";

import BaseCard from "@/components/base/BaseCard.vue";
import type { Pizza } from "@/types/pizza";

interface PizzaCardProps {
  pizza: Pizza;
  disabled?: boolean;
}

interface PizzaCardEmits {
  addToCart: [pizzaId: string];
}

const { pizza, disabled = false } = defineProps<PizzaCardProps>();
const emit = defineEmits<PizzaCardEmits>();

const formattedPrice = computed(() => `$${pizza.price.toFixed(2)}`);
</script>

<template>
  <BaseCard :title="pizza.name" :subtitle="formattedPrice">
    <Button label="Add to cart" :disabled="disabled" @click="emit('addToCart', pizza.id)" />
  </BaseCard>
</template>
```

- Never mutate props; use `defineModel<T>()` for two-way binding and `defineSlots<...>()` for typed slots.
- Named functions need explicit return types; type imports are inline (`import { type Ref, ref } from "vue"`).
- Import PrimeVue components per file. `npm run lint:fix` sorts imports and removes unused ones.

## 3. Logic: composables, Pinia, vue-query

| State | Where |
|---|---|
| Server data | `useQuery`/`useMutation` wrapped in a composable — never copied into Pinia |
| Global client state (cart, user, preferences) | Pinia **setup** store: `defineStore("cart", () => { ...; return {...} })` |
| Reusable logic (pagination, search, Vuelidate forms) | Composable `use<Name>()` |
| One component's UI state | Local `ref` |

- Composables: one concern, explicit return type, accept `MaybeRefOrGetter<T>` + `toValue()`, return refs (destructurable).
- Stores: read state with `storeToRefs()`, call actions directly; use them in views, not in dumb components.
- Routing: `useRoute()` / `useRouter()` only; navigate by name (`router.push({ name: "pizza-details", params: { id } })`) and `void`/`await` the promise. Keep filters/search/page in `route.query`.

## 4. Template & styling

- Compose view → feature → base/PrimeVue. Duplicated markup means a missing component; vary layout with slots, not boolean-prop piles.
- Use PrimeVue for controls and configure them via props (`severity`, `size`, `text`, `invalid`) or `pt`.
- Style with Tailwind + `tailwindcss-primeui` tokens only — no hard-coded colors, no `!important`, no `<style>` for what utilities do:
  `bg-primary` `text-primary-contrast` · `bg-surface-0 dark:bg-surface-900` · `text-color` `text-muted-color` · `bg-emphasis` `bg-highlight` · `border-surface` `rounded-border`.
- Dark mode via `dark:` (`.app-dark`); layer order in `src/styles/main.css` lets utilities override PrimeVue.
- Stable `:key` on `v-for` (never the index), no `v-if` with `v-for`.

**Done when:** `npm run lint:fix` and `npm run type-check` pass.
