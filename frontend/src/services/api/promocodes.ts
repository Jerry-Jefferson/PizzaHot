import type { Promocode, PromocodePayload } from "@/types/promocode.types";

import { apiClient } from "..";

export async function listPromocodes(): Promise<Promocode[]> {
  const { data } = await apiClient.get<Promocode[]>("/promocodes");
  return data;
}

export async function createPromocode(payload: PromocodePayload): Promise<Promocode> {
  const { data } = await apiClient.post<Promocode>("/promocodes", payload);
  return data;
}

export async function updatePromocode(id: string, payload: PromocodePayload): Promise<Promocode> {
  const { data } = await apiClient.put<Promocode>(`/promocodes/${id}`, payload);
  return data;
}

export async function deletePromocode(id: string): Promise<void> {
  await apiClient.delete(`/promocodes/${id}`);
}

export async function restorePromocode(id: string): Promise<Promocode> {
  const { data } = await apiClient.patch<Promocode>(`/promocodes/${id}/restore`);
  return data;
}
