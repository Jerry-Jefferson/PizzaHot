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
} from "@/api/cart";
import { useAuthStore } from "@/stores/auth";
import type {
  AddCartItemPayload,
  Cart,
  CartItem,
  UpdateCartItemPayload,
} from "@/types/cart.types";

export const CART_QUERY_KEY = ["cart"] as const;
const UPDATE_CART_ITEM_KEY = ["cart", "update-item"] as const;

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
  return queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
}

export function useCart(): UseQueryReturnType<Cart, Error> {
  const { isAuthenticated } = storeToRefs(useAuthStore());

  return useQuery({
    queryKey: CART_QUERY_KEY,
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

export function useAddToCart(): UseMutationReturnType<
  CartItem,
  Error,
  AddCartItemPayload,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => addItem(payload),
    onSuccess: async (item) => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, (cart) => upsertCartItem(cart, item));
      await refreshCart(queryClient);
    },
  });
}

export function useUpdateCartItem(): UseMutationReturnType<
  CartItem | null,
  Error,
  UpdateCartItemPayload,
  CartSnapshot
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: UPDATE_CART_ITEM_KEY,
    mutationFn: (payload) => updateItemQuantity(payload),
    onMutate: async ({ pizzaId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<Cart>(CART_QUERY_KEY);
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, (cart) =>
        setItemQuantity(cart, pizzaId, quantity)
      );
      return { previousCart };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSuccess: (item) => {
      if (item) {
        queryClient.setQueryData<Cart>(CART_QUERY_KEY, (cart) => upsertCartItem(cart, item));
      }
    },
    onSettled: async () => {
      if (queryClient.isMutating({ mutationKey: UPDATE_CART_ITEM_KEY }) === 1) {
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
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
  });
}

export function useRemovePromocode(): UseMutationReturnType<Cart, Error, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removePromocode(),
    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
  });
}
