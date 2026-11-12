import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/api";
import { listMyOrders } from "@/api/orders";

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
});
