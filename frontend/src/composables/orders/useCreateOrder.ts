import { useMutation, type UseMutationReturnType, useQueryClient } from "@tanstack/vue-query";

import { createOrder } from "@/services/api/orders";
import type { Cart } from "@/types/cart.types";
import type { CreateOrderPayload, Order } from "@/types/order.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";
import { logError } from "@/utils/logger";

export const CART_CLEAR_REFETCH_DELAY_MS = 1000;

function emptied(cart: Cart | undefined): Cart | undefined {
  return (
    cart && {
      ...cart,
      cartItems: [],
      promocode: null,
      totalPrice: 0,
      discountAmount: 0,
      finalPrice: 0,
    }
  );
}

export function useCreateOrder(): UseMutationReturnType<Order, Error, CreateOrderPayload, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createOrder(payload),
    onSuccess: () => {
      queryClient.setQueryData<Cart>(QUERY_KEYS.cart, emptied);
      setTimeout(() => {
        queryClient
          .invalidateQueries({ queryKey: QUERY_KEYS.cart })
          .catch(logError("Cart refetch after order"));
      }, CART_CLEAR_REFETCH_DELAY_MS);
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myOrders.all });
    },
  });
}
