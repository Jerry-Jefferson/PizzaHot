import { HttpStatusCode } from "axios";

import type { Cart, CartItem, CartItemPayload } from "@/types/cart.types";

import { apiClient } from "..";

const NO_CONTENT_STATUS: number = HttpStatusCode.NoContent;

export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>("/carts");
  return data;
}

export async function addItem(payload: CartItemPayload): Promise<CartItem> {
  const { data } = await apiClient.post<CartItem>("/carts/items", payload);
  return data;
}

export async function updateItemQuantity({
  pizzaId,
  quantity,
}: CartItemPayload): Promise<CartItem | null> {
  const response = await apiClient.patch<CartItem>(`/carts/items/${pizzaId}`, { quantity });
  return response.status === NO_CONTENT_STATUS ? null : response.data;
}

export async function removeItem(pizzaId: string): Promise<void> {
  await apiClient.delete(`/carts/items/${pizzaId}`);
}

export async function clearCart(): Promise<void> {
  await apiClient.delete("/carts");
}

export async function applyPromocode(code: string): Promise<Cart> {
  const { data } = await apiClient.post<Cart>("/carts/promocode", { code });
  return data;
}

export async function removePromocode(): Promise<Cart> {
  const { data } = await apiClient.delete<Cart>("/carts/promocode");
  return data;
}
