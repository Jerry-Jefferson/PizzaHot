import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/services";
import { createIngredient, listIngredients } from "@/services/api/ingredients";

const response = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ingredients api", () => {
  it("lists all ingredients through GET /ingredients", async () => {
    const ingredients = [{ id: "i1", name: "Basil" }];
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(response(ingredients));

    await expect(listIngredients()).resolves.toEqual(ingredients);
    expect(get).toHaveBeenCalledWith("/ingredients");
  });

  it("creates an ingredient with a trimmed name through POST /ingredients", async () => {
    const ingredient = { id: "i2", name: "Oregano" };
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response(ingredient));

    await expect(createIngredient("  Oregano ")).resolves.toEqual(ingredient);
    expect(post).toHaveBeenCalledWith("/ingredients", { name: "Oregano" });
  });
});
