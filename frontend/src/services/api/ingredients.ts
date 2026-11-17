import type { Ingredient } from "@/types/pizza.types";

import { apiClient } from "..";

export async function listIngredients(): Promise<Ingredient[]> {
  const { data } = await apiClient.get<Ingredient[]>("/ingredients");
  return data;
}

export async function createIngredient(name: string): Promise<Ingredient> {
  const { data } = await apiClient.post<Ingredient>("/ingredients", { name: name.trim() });
  return data;
}
