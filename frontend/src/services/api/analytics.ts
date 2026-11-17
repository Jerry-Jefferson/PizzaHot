import type { MostOrderedPizza } from "@/types/analytics.types";

import { apiClient } from "..";

export async function getPopularPizza(
  month: number,
  year: number
): Promise<MostOrderedPizza | null> {
  const { data } = await apiClient.get<MostOrderedPizza | "">("/analytics/popular-pizza", {
    params: { month, year },
  });
  return data || null;
}
