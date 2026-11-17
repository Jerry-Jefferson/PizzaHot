import type { Paginated } from "@/types/pagination.types";
import type { Pizza, PizzaListQuery, PizzaPayload } from "@/types/pizza.types";

import { apiClient } from "..";

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

export async function createPizza(payload: PizzaPayload): Promise<Pizza> {
  const { data } = await apiClient.post<Pizza>("/pizzas", payload);
  return data;
}

export async function updatePizza(id: string, payload: PizzaPayload): Promise<Pizza> {
  const { data } = await apiClient.put<Pizza>(`/pizzas/${id}`, payload);
  return data;
}

export async function uploadPizzaImage(id: string, image: File): Promise<Pizza> {
  const body = new FormData();
  body.append("image", image);
  const { data } = await apiClient.patch<Pizza>(`/pizzas/${id}/image`, body);
  return data;
}

export async function deletePizza(id: string): Promise<void> {
  await apiClient.delete(`/pizzas/${id}`);
}
