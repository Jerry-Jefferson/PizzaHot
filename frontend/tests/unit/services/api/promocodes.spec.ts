import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/services";
import {
  createPromocode,
  deletePromocode,
  listPromocodes,
  restorePromocode,
  updatePromocode,
} from "@/services/api/promocodes";

const response = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

const PAYLOAD = {
  code: "WELCOME20",
  discount: 20,
  discountMode: "percentage",
  validTill: "2026-12-31T23:59:59.999Z",
} as const;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("promocodes api", () => {
  it("lists every promo code through GET /promocodes", async () => {
    const promocodes = [{ id: "c1" }];
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(promocodes));

    await expect(listPromocodes()).resolves.toEqual(promocodes);
    expect(get).toHaveBeenCalledWith("/promocodes");
  });

  it("creates a promo code through POST /promocodes", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response({ id: "c1" }));

    await expect(createPromocode(PAYLOAD)).resolves.toEqual({ id: "c1" });
    expect(post).toHaveBeenCalledWith("/promocodes", PAYLOAD);
  });

  it("updates a promo code through PUT /promocodes/:id", async () => {
    const put = vi.spyOn(apiClient, "put").mockResolvedValue(response({ id: "c1" }));

    await expect(updatePromocode("c1", PAYLOAD)).resolves.toEqual({ id: "c1" });
    expect(put).toHaveBeenCalledWith("/promocodes/c1", PAYLOAD);
  });

  it("deactivates a promo code through DELETE /promocodes/:id", async () => {
    const remove = vi.spyOn(apiClient, "delete").mockResolvedValue(response(undefined));

    await expect(deletePromocode("c1")).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith("/promocodes/c1");
  });

  it("restores a promo code through PATCH /promocodes/:id/restore", async () => {
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue(response({ id: "c1" }));

    await expect(restorePromocode("c1")).resolves.toEqual({ id: "c1" });
    expect(patch).toHaveBeenCalledWith("/promocodes/c1/restore");
  });
});
