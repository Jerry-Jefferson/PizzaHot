import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

import * as cartApi from "@/api/cart";
import {
  CART_QUERY_KEY,
  useAddToCart,
  useCart,
  useCartItemCount,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/composables/useCart";
import { useAuthStore } from "@/stores/auth";
import type { Cart, CartItem } from "@/types/cart.types";
import type { User } from "@/types/user.types";

vi.mock("@/api/cart", () => ({
  getCart: vi.fn(),
  addItem: vi.fn(),
  updateItemQuantity: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
  applyPromocode: vi.fn(),
  removePromocode: vi.fn(),
}));
vi.mock("@/api/auth", () => ({ me: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }));

const item = (pizzaId: string, quantity: number): CartItem => ({
  id: `item-${pizzaId}`,
  pizza: { id: pizzaId, name: pizzaId, price: 10, image: null },
  quantity,
});

const cartWith = (...cartItems: CartItem[]): Cart => ({
  id: "c1",
  cartItems,
  promocode: null,
  totalPrice: 0,
  discountAmount: 0,
  finalPrice: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const badRequest = new AxiosError("Bad", "ERR_BAD_REQUEST", config, null, {
  data: { statusCode: 400, message: "Quantity cannot exceed 50" },
  status: 400,
  statusText: "",
  headers: {} as RawAxiosResponseHeaders,
  config,
});

function withQuery<T>(composable: () => T, signedIn = true) {
  const pinia = createPinia();
  setActivePinia(pinia);
  if (signedIn) {
    useAuthStore().setUser({ id: "u1", role: "user" } as User);
  }
  let result!: T;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  mount(
    defineComponent({
      setup: () => {
        result = composable();
        return () => null;
      },
    }),
    { global: { plugins: [pinia, [VueQueryPlugin, { queryClient }]] } }
  );
  return { result, queryClient };
}

const cachedCart = (queryClient: QueryClient) => queryClient.getQueryData<Cart>(CART_QUERY_KEY);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useCart", () => {
  it("loads the cart for a signed-in user", async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith(item("p1", 1)));

    const { result } = withQuery(() => useCart());
    await flushPromises();

    expect(result.data.value?.cartItems).toHaveLength(1);
  });

  it("does not request the cart for a guest", async () => {
    withQuery(() => useCart(), false);
    await flushPromises();

    expect(cartApi.getCart).not.toHaveBeenCalled();
  });
});

describe("useCartItemCount", () => {
  it("sums the quantities of all items", async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith(item("p1", 2), item("p2", 3)));

    const { result } = withQuery(() => useCartItemCount());
    await flushPromises();

    expect(result.value).toBe(5);
  });

  it("is 0 without a cart", () => {
    const { result } = withQuery(() => useCartItemCount(), false);

    expect(result.value).toBe(0);
  });
});

describe("useAddToCart", () => {
  it("writes the returned item into the cart and refetches the totals", async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith(item("p1", 3), item("p2", 1)));
    vi.mocked(cartApi.addItem).mockResolvedValue(item("p2", 1));
    const { result, queryClient } = withQuery(() => useAddToCart());
    queryClient.setQueryData(CART_QUERY_KEY, cartWith(item("p1", 3)));
    const setQueryData = vi.spyOn(queryClient, "setQueryData");
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await result.mutateAsync({ pizzaId: "p2", quantity: 1 });

    expect(cartApi.addItem).toHaveBeenCalledWith({ pizzaId: "p2", quantity: 1 });
    expect(setQueryData).toHaveBeenCalledWith(CART_QUERY_KEY, expect.any(Function));
    expect(setQueryData.mock.results[0]?.value).toEqual(cartWith(item("p1", 3), item("p2", 1)));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: CART_QUERY_KEY });
  });

  it("replaces an item that is already in the cart", async () => {
    vi.mocked(cartApi.getCart).mockReturnValue(new Promise(() => undefined));
    vi.mocked(cartApi.addItem).mockResolvedValue(item("p1", 4));
    const { result, queryClient } = withQuery(() => useAddToCart());
    queryClient.setQueryData(CART_QUERY_KEY, cartWith(item("p1", 3)));

    await result.mutateAsync({ pizzaId: "p1", quantity: 1 });

    expect(cachedCart(queryClient)?.cartItems).toEqual([item("p1", 4)]);
  });
});

describe("useUpdateCartItem", () => {
  it("updates the quantity optimistically before the server answers", async () => {
    let resolveUpdate!: (value: CartItem | null) => void;
    vi.mocked(cartApi.updateItemQuantity).mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      })
    );
    vi.mocked(cartApi.getCart).mockResolvedValue(cartWith(item("p1", 5)));
    const { result, queryClient } = withQuery(() => useUpdateCartItem());
    queryClient.setQueryData(CART_QUERY_KEY, cartWith(item("p1", 2)));

    result.mutate({ pizzaId: "p1", quantity: 5 });
    await flushPromises();

    expect(cachedCart(queryClient)?.cartItems[0]?.quantity).toBe(5);

    resolveUpdate(item("p1", 5));
    await flushPromises();

    expect(cachedCart(queryClient)?.cartItems[0]?.quantity).toBe(5);
  });

  it("rolls back to the previous cart on error", async () => {
    vi.mocked(cartApi.updateItemQuantity).mockRejectedValue(badRequest);
    vi.mocked(cartApi.getCart).mockReturnValue(new Promise(() => undefined));
    const { result, queryClient } = withQuery(() => useUpdateCartItem());
    const previous = cartWith(item("p1", 2));
    queryClient.setQueryData(CART_QUERY_KEY, previous);

    await expect(result.mutateAsync({ pizzaId: "p1", quantity: 51 })).rejects.toBe(badRequest);

    expect(cachedCart(queryClient)).toEqual(previous);
  });

  it("drops the item at quantity 0 and refetches after the 204", async () => {
    vi.mocked(cartApi.updateItemQuantity).mockResolvedValue(null);
    vi.mocked(cartApi.getCart).mockReturnValue(new Promise(() => undefined));
    const { result, queryClient } = withQuery(() => useUpdateCartItem());
    queryClient.setQueryData(CART_QUERY_KEY, cartWith(item("p1", 2), item("p2", 1)));
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await result.mutateAsync({ pizzaId: "p1", quantity: 0 });

    expect(cachedCart(queryClient)?.cartItems).toEqual([item("p2", 1)]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: CART_QUERY_KEY });
  });
});

describe("useRemoveCartItem / useClearCart", () => {
  it("invalidates the cart after removing an item", async () => {
    vi.mocked(cartApi.removeItem).mockResolvedValue();
    const { result, queryClient } = withQuery(() => useRemoveCartItem());
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await result.mutateAsync("p1");

    expect(cartApi.removeItem).toHaveBeenCalledWith("p1");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: CART_QUERY_KEY });
  });

  it("invalidates the cart after clearing it", async () => {
    vi.mocked(cartApi.clearCart).mockResolvedValue();
    const { result, queryClient } = withQuery(() => useClearCart());
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await result.mutateAsync();

    expect(cartApi.clearCart).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: CART_QUERY_KEY });
  });
});
