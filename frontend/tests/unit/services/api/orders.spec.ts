import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/services";
import {
  createOrder,
  getMyOrder,
  getOrder,
  getOrdersByUser,
  listMyOrders,
  searchOrders,
  updateOrderStatus,
} from "@/services/api/orders";

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

  it("searches orders through POST /orders/search with the filters in the body", async () => {
    const page = { data: [], page: 1, limit: 1, total: 3, totalPages: 3 };
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response(page));
    const query = { status: "pending", limit: 1 } as const;

    await expect(searchOrders(query)).resolves.toEqual(page);
    expect(post).toHaveBeenCalledWith("/orders/search", query);
  });

  it("gets any order through GET /orders/:id", async () => {
    const order = { id: "o1" };
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(order));

    await expect(getOrder("o1")).resolves.toEqual(order);
    expect(get).toHaveBeenCalledWith("/orders/o1");
  });

  it("lists a user's orders through GET /orders/user/:userId with pagination params", async () => {
    const page = { data: [], page: 1, limit: 5, total: 0, totalPages: 0 };
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(page));

    await expect(getOrdersByUser("u1", { limit: 5 })).resolves.toEqual(page);
    expect(get).toHaveBeenCalledWith("/orders/user/u1", { params: { limit: 5 } });
  });

  it("updates the status through PATCH /orders/:id/status", async () => {
    const order = { id: "o1", status: "confirmed" };
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue(response(order));

    await expect(updateOrderStatus("o1", "confirmed")).resolves.toEqual(order);
    expect(patch).toHaveBeenCalledWith("/orders/o1/status", { status: "confirmed" });
  });
});
