import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/api";
import { getPizza, listPizzas } from "@/api/pizzas";

const response = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("pizzas api", () => {
  it("lists pizzas through GET /pizzas with a trimmed search", async () => {
    const page = { data: [], page: 2, limit: 9, total: 0, totalPages: 0 };
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(page));

    await expect(listPizzas({ page: 2, limit: 9, search: "  marg " })).resolves.toEqual(page);
    expect(get).toHaveBeenCalledWith("/pizzas", {
      params: { page: 2, limit: 9, search: "marg" },
    });
  });

  it("omits a blank search", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response({}));

    await listPizzas({ search: "   " });

    expect(get).toHaveBeenCalledWith("/pizzas", {
      params: { page: undefined, limit: undefined, search: undefined },
    });
  });

  it("gets one pizza through GET /pizzas/:id", async () => {
    const pizza = { id: "p1", name: "Margherita" };
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(pizza));

    await expect(getPizza("p1")).resolves.toEqual(pizza);
    expect(get).toHaveBeenCalledWith("/pizzas/p1");
  });
});
