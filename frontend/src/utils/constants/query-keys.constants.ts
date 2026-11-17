import type { MaybeRef } from "vue";

export const QUERY_KEYS = {
  cart: ["cart"] as const,
  cartUpdateItem: ["cart", "update-item"] as const,
  pizzas: {
    all: ["pizzas"] as const,
    list: (page: MaybeRef<number>, limit: MaybeRef<number>, search: MaybeRef<string>) =>
      ["pizzas", "list", page, limit, search] as const,
    detail: (id: MaybeRef<string>) => ["pizzas", "detail", id] as const,
  },
  myOrders: {
    all: ["orders", "my"] as const,
    list: (page: MaybeRef<number>, limit: MaybeRef<number>) =>
      ["orders", "my", "list", page, limit] as const,
    detail: (id: MaybeRef<string>) => ["orders", "my", "detail", id] as const,
  },
};
