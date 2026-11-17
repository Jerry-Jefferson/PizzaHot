import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/services";
import { getPopularPizza } from "@/services/api/analytics";

const response = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("analytics api", () => {
  it("gets the most ordered pizza of a month through GET /analytics/popular-pizza", async () => {
    const popular = { pizzaName: "Margherita", orderCount: 12 };
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(popular));

    await expect(getPopularPizza(5, 2026)).resolves.toEqual(popular);
    expect(get).toHaveBeenCalledWith("/analytics/popular-pizza", {
      params: { month: 5, year: 2026 },
    });
  });

  it.each([
    ["an empty body", ""],
    ["null", null],
  ])("returns null when the month has no orders (%s)", async (_label, body) => {
    vi.spyOn(apiClient, "get").mockResolvedValue(response(body));

    await expect(getPopularPizza(5, 2026)).resolves.toBeNull();
  });
});
