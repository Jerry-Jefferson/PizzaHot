import type { MaybeRef } from "vue";

import type { OrderSearchQuery } from "@/types/order.types";

export const QUERY_KEYS = {
  cart: ["cart"] as const,
  cartUpdateItem: ["cart", "update-item"] as const,
  pizzas: {
    all: ["pizzas"] as const,
    lists: ["pizzas", "list"] as const,
    list: (page: MaybeRef<number>, limit: MaybeRef<number>, search: MaybeRef<string>) =>
      ["pizzas", "list", page, limit, search] as const,
    detail: (id: MaybeRef<string>) => ["pizzas", "detail", id] as const,
  },
  ingredients: ["ingredients"] as const,
  myOrders: {
    all: ["orders", "my"] as const,
    list: (page: MaybeRef<number>, limit: MaybeRef<number>) =>
      ["orders", "my", "list", page, limit] as const,
    detail: (id: MaybeRef<string>) => ["orders", "my", "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    search: (query: MaybeRef<OrderSearchQuery>) => ["orders", "search", query] as const,
    byUser: (userId: MaybeRef<string>) => ["orders", "user", userId] as const,
  },
  users: {
    all: ["users"] as const,
    list: (page: MaybeRef<number>, limit: MaybeRef<number>, search: MaybeRef<string>) =>
      ["users", "list", page, limit, search] as const,
    detail: (id: MaybeRef<string>) => ["users", "detail", id] as const,
  },
  promocodes: ["promocodes"] as const,
  analytics: {
    popularPizza: (month: MaybeRef<number>, year: MaybeRef<number>) =>
      ["analytics", "popular-pizza", month, year] as const,
  },
};
