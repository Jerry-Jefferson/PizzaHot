import { useMutation, type UseMutationReturnType, useQueryClient } from "@tanstack/vue-query";

import { createOrder } from "@/api/orders";
import type { Cart } from "@/types/cart.types";
import type { CreateOrderPayload, Order } from "@/types/order.types";

import { CART_QUERY_KEY } from "./useCart";

export const CART_CLEAR_REFETCH_DELAY_MS = 1000;

function emptied(cart: Cart | undefined): Cart | undefined {
  return cart && { ...cart, cartItems: [], promocode: null, totalPrice: 0, discountAmount: 0, finalPrice: 0 };
}

export function useCreateOrder(): UseMutationReturnType<
  Order,
  Error,
  CreateOrderPayload,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createOrder(payload),
    onSuccess: () => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, emptied);
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      }, CART_CLEAR_REFETCH_DELAY_MS);
      void queryClient.invalidateQueries({ queryKey: ["orders", "my"] });
    },
  });
}
