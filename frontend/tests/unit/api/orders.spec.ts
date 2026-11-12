import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/api";
import { createOrder, getMyOrder, listMyOrders } from "@/api/orders";

const response = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("orders api", () => {
  it("lists my orders through GET /orders/my with pagination params", async () => {
    const page = { data: [], page: 2, limit: 5, total: 0, totalPages: 0 };
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(page));

    await expect(listMyOrders({ page: 2, limit: 5 })).resolves.toEqual(page);
    expect(get).toHaveBeenCalledWith("/orders/my", { params: { page: 2, limit: 5 } });
  });

  it("creates an order through POST /orders", async () => {
    const order = { id: "o1" };
    const payload = { delivery: "pickup", paymentMethod: "cash", comment: null } as const;
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response(order));

    await expect(createOrder(payload)).resolves.toEqual(order);
    expect(post).toHaveBeenCalledWith("/orders", payload);
  });

  it("gets one of my orders through GET /orders/my/:id", async () => {
    const order = { id: "o1" };
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(order));

    await expect(getMyOrder("o1")).resolves.toEqual(order);
    expect(get).toHaveBeenCalledWith("/orders/my/o1");
  });
});
