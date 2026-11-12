import type { Paginated } from "@/types/api.types";
import type { Pizza, PizzaListQuery } from "@/types/pizza.types";

import { apiClient } from ".";

export async function listPizzas(query: PizzaListQuery = {}): Promise<Paginated<Pizza>> {
  const search = query.search?.trim();
  const { data } = await apiClient.get<Paginated<Pizza>>("/pizzas", {
    params: { page: query.page, limit: query.limit, search: search === "" ? undefined : search },
  });
  return data;
}

export async function getPizza(id: string): Promise<Pizza> {
  const { data } = await apiClient.get<Pizza>(`/pizzas/${id}`);
  return data;
}
