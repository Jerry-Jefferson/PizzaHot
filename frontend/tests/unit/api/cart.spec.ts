import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/api";
import {
  addItem,
  applyPromocode,
  clearCart,
  getCart,
  removeItem,
  removePromocode,
  updateItemQuantity,
} from "@/api/cart";

type ApiResponse = Awaited<ReturnType<typeof apiClient.get>>;
const response = (data: unknown, status = 200) => ({ data, status }) as ApiResponse;

const CART = { id: "c1", cartItems: [] };
const ITEM = { id: "i1", pizza: null, quantity: 2 };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("cart api", () => {
  it("gets the cart through GET /carts", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(CART));

    await expect(getCart()).resolves.toEqual(CART);
    expect(get).toHaveBeenCalledWith("/carts");
  });

  it("adds an item through POST /carts/items", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response(ITEM, 201));

    await expect(addItem({ pizzaId: "p1", quantity: 2 })).resolves.toEqual(ITEM);
    expect(post).toHaveBeenCalledWith("/carts/items", { pizzaId: "p1", quantity: 2 });
  });

  it("updates an item quantity through PATCH /carts/items/:pizzaId", async () => {
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue(response(ITEM));

    await expect(updateItemQuantity({ pizzaId: "p1", quantity: 2 })).resolves.toEqual(ITEM);
    expect(patch).toHaveBeenCalledWith("/carts/items/p1", { quantity: 2 });
  });

  it("returns null when the quantity update answers 204", async () => {
    vi.spyOn(apiClient, "patch").mockResolvedValue(response("", 204));

    await expect(updateItemQuantity({ pizzaId: "p1", quantity: 0 })).resolves.toBeNull();
  });

  it("removes an item and clears the cart through DELETE", async () => {
    const remove = vi.spyOn(apiClient, "delete").mockResolvedValue(response("", 204));

    await removeItem("p1");
    await clearCart();

    expect(remove).toHaveBeenNthCalledWith(1, "/carts/items/p1");
    expect(remove).toHaveBeenNthCalledWith(2, "/carts");
  });

  it("applies and removes a promo code", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response(CART));
    const remove = vi.spyOn(apiClient, "delete").mockResolvedValue(response(CART));

    await expect(applyPromocode("WELCOME20")).resolves.toEqual(CART);
    await expect(removePromocode()).resolves.toEqual(CART);

    expect(post).toHaveBeenCalledWith("/carts/promocode", { code: "WELCOME20" });
    expect(remove).toHaveBeenCalledWith("/carts/promocode");
  });
});
