import {
  type QueryClient,
  useMutation,
  type UseMutationReturnType,
  useQuery,
  useQueryClient,
  type UseQueryReturnType,
} from "@tanstack/vue-query";
import { storeToRefs } from "pinia";
import { computed, type ComputedRef } from "vue";

import {
  addItem,
  applyPromocode,
  clearCart,
  getCart,
  removeItem,
  removePromocode,
  updateItemQuantity,
} from "@/services/api/cart";
import { useAuthStore } from "@/stores/auth";
import type { Cart, CartItem, CartItemPayload } from "@/types/cart.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

interface CartSnapshot {
  previousCart: Cart | undefined;
}

function upsertCartItem(cart: Cart | undefined, item: CartItem): Cart | undefined {
  if (!cart) {
    return cart;
  }
  const exists = cart.cartItems.some((cartItem) => cartItem.id === item.id);
  const cartItems = exists
    ? cart.cartItems.map((cartItem) => (cartItem.id === item.id ? item : cartItem))
    : [...cart.cartItems, item];
  return { ...cart, cartItems };
}

function setItemQuantity(
  cart: Cart | undefined,
  pizzaId: string,
  quantity: number
): Cart | undefined {
  if (!cart) {
    return cart;
  }
  const cartItems = cart.cartItems
    .map((item) => (item.pizza?.id === pizzaId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  return { ...cart, cartItems };
}

function refreshCart(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
}

export function useCart(): UseQueryReturnType<Cart, Error> {
  const { isAuthenticated } = storeToRefs(useAuthStore());

  return useQuery({
    queryKey: QUERY_KEYS.cart,
    queryFn: () => getCart(),
    enabled: isAuthenticated,
  });
}

export function useCartItemCount(): ComputedRef<number> {
  const { data: cart } = useCart();
  return computed(
    () => cart.value?.cartItems.reduce((count, item) => count + item.quantity, 0) ?? 0
  );
}

export function useAddToCart(): UseMutationReturnType<CartItem, Error, CartItemPayload, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => addItem(payload),
    onSuccess: async (item) => {
      queryClient.setQueryData<Cart>(QUERY_KEYS.cart, (cart) => upsertCartItem(cart, item));
      await refreshCart(queryClient);
    },
  });
}

export function useUpdateCartItem(): UseMutationReturnType<
  CartItem | null,
  Error,
  CartItemPayload,
  CartSnapshot
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: QUERY_KEYS.cartUpdateItem,
    mutationFn: (payload) => updateItemQuantity(payload),
    onMutate: async ({ pizzaId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.cart });
      const previousCart = queryClient.getQueryData<Cart>(QUERY_KEYS.cart);
      queryClient.setQueryData<Cart>(QUERY_KEYS.cart, (cart) =>
        setItemQuantity(cart, pizzaId, quantity)
      );
      return { previousCart };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(QUERY_KEYS.cart, context.previousCart);
      }
    },
    onSuccess: (item) => {
      if (item) {
        queryClient.setQueryData<Cart>(QUERY_KEYS.cart, (cart) => upsertCartItem(cart, item));
      }
    },
    onSettled: async () => {
      if (queryClient.isMutating({ mutationKey: QUERY_KEYS.cartUpdateItem }) === 1) {
        await refreshCart(queryClient);
      }
    },
  });
}

export function useRemoveCartItem(): UseMutationReturnType<void, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pizzaId) => removeItem(pizzaId),
    onSuccess: () => refreshCart(queryClient),
  });
}

export function useClearCart(): UseMutationReturnType<void, Error, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => refreshCart(queryClient),
  });
}

export function useApplyPromocode(): UseMutationReturnType<Cart, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code) => applyPromocode(code),
    onSuccess: (cart) => {
      queryClient.setQueryData(QUERY_KEYS.cart, cart);
    },
  });
}

export function useRemovePromocode(): UseMutationReturnType<Cart, Error, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removePromocode(),
    onSuccess: (cart) => {
      queryClient.setQueryData(QUERY_KEYS.cart, cart);
    },
  });
}
