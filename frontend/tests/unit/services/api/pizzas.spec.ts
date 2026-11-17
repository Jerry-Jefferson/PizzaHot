import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/services";
import {
  createPizza,
  deletePizza,
  getPizza,
  listPizzas,
  updatePizza,
  uploadPizzaImage,
} from "@/services/api/pizzas";

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

  const PAYLOAD = { name: "Diavola", description: "Spicy", price: 12.5, ingredientIds: ["i1"] };

  it("creates a pizza through POST /pizzas", async () => {
    const pizza = { id: "p1", name: "Diavola" };
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(response(pizza));

    await expect(createPizza(PAYLOAD)).resolves.toEqual(pizza);
    expect(post).toHaveBeenCalledWith("/pizzas", PAYLOAD);
  });

  it("replaces a pizza through PUT /pizzas/:id with the full body", async () => {
    const pizza = { id: "p1", name: "Diavola" };
    const put = vi.spyOn(apiClient, "put").mockResolvedValue(response(pizza));

    await expect(updatePizza("p1", PAYLOAD)).resolves.toEqual(pizza);
    expect(put).toHaveBeenCalledWith("/pizzas/p1", PAYLOAD);
  });

  it('uploads the image as multipart field "image" through PATCH /pizzas/:id/image', async () => {
    const pizza = { id: "p1", image: "/uploads/pizzas/p1.png" };
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue(response(pizza));
    const file = new File(["png"], "diavola.png", { type: "image/png" });

    await expect(uploadPizzaImage("p1", file)).resolves.toEqual(pizza);

    const [url, body] = patch.mock.calls[0] ?? [];
    expect(url).toBe("/pizzas/p1/image");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("image")).toBe(file);
  });

  it("deletes a pizza through DELETE /pizzas/:id", async () => {
    const remove = vi.spyOn(apiClient, "delete").mockResolvedValue(response(undefined));

    await expect(deletePizza("p1")).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith("/pizzas/p1");
  });
});
