import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PizzaCleanupService } from "../pizzas/pizza-cleanup.service.ts";
import type { IPizzasRepository } from "../pizzas/pizza.types.ts";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

describe("PizzaCleanupService", () => {
  let deleteNotOrderedSince: jest.Mock<IPizzasRepository["deleteNotOrderedSince"]>;
  let service: PizzaCleanupService;

  beforeEach(() => {
    deleteNotOrderedSince = jest
      .fn<IPizzasRepository["deleteNotOrderedSince"]>()
      .mockResolvedValue(0);

    service = new PizzaCleanupService({
      deleteNotOrderedSince,
    } as unknown as IPizzasRepository);
  });

  it("deletes with a cutoff thirty days back", async () => {
    await service.handleCleanup();

    const cutoff = deleteNotOrderedSince.mock.calls[0][0];
    expect(Date.now() - cutoff.getTime()).toBeCloseTo(THIRTY_DAYS_MS, -4);
  });

  it("reports how many were deleted", async () => {
    deleteNotOrderedSince.mockResolvedValue(4);

    await expect(service.handleCleanup()).resolves.toBe(4);
  });

  it("survives a database failure", async () => {
    deleteNotOrderedSince.mockRejectedValue(new Error("db down"));

    await expect(service.handleCleanup()).resolves.toBe(0);
  });

  it("survives something thrown that is not an Error", async () => {
    deleteNotOrderedSince.mockRejectedValue("just a string");

    await expect(service.handleCleanup()).resolves.toBe(0);
  });
});
