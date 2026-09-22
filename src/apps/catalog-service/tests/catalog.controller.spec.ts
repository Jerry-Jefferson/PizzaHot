import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import type { ClientProxy, RmqContext } from "@nestjs/microservices";
import { CatalogMessagesController } from "../catalog.controller.ts";
import type { PizzasService } from "../pizzas/pizzas.service.ts";
import type { IngredientsService } from "../ingredients/ingredients.service.ts";
import type { IPizzasRepository } from "../pizzas/pizza.types.ts";
import type { Pizza } from "../pizzas/pizza.entity.ts";
import { EVENTS } from "../../../libs/contracts/index.ts";

type AnyMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;

function anyMock(value: unknown = undefined): AnyMock {
  return jest.fn<(...args: unknown[]) => Promise<unknown>>().mockResolvedValue(value);
}

function pizza(id: string, name: string, price: number): Pizza {
  return { id, name, price } as Pizza;
}

describe("CatalogMessagesController", () => {
  let pizzas: Record<string, AnyMock>;
  let ingredients: Record<string, AnyMock>;
  let repository: { findByIds: AnyMock; markOrdered: AnyMock };
  let events: { emit: jest.Mock<(pattern: string, data: unknown) => unknown> };
  let controller: CatalogMessagesController;

  beforeEach(() => {
    pizzas = {
      findAll: anyMock({ data: [], total: 0 }),
      getById: anyMock({ id: "p1" }),
      create: anyMock({ id: "p1" }),
      update: anyMock({ id: "p1" }),
      setImagePath: anyMock({ id: "p1" }),
      remove: anyMock(undefined),
    };
    ingredients = {
      findAll: anyMock([]),
      findById: anyMock({ id: "i1" }),
      create: anyMock({ id: "i1" }),
      update: anyMock({ id: "i1" }),
      remove: anyMock(undefined),
    };
    repository = { findByIds: anyMock([]), markOrdered: anyMock(undefined) };
    events = { emit: jest.fn<(pattern: string, data: unknown) => unknown>() };

    controller = new CatalogMessagesController(
      pizzas as unknown as PizzasService,
      ingredients as unknown as IngredientsService,
      repository as unknown as IPizzasRepository,
      events as unknown as ClientProxy
    );
  });

  it("unwraps the payload of every pizza request", async () => {
    await controller.list({ page: 2, limit: 5, search: "marg" });
    await controller.findById({ id: "p1" });
    await controller.create({ name: "X", description: "d", price: 1 });
    await controller.update({ id: "p1", dto: { price: 9 } });
    await controller.setImage({ id: "p1", imagePath: "/uploads/pizzas/a.png" });

    expect(pizzas.findAll).toHaveBeenCalledWith(2, 5, "marg");
    expect(pizzas.getById).toHaveBeenCalledWith("p1");
    expect(pizzas.create).toHaveBeenCalledWith({ name: "X", description: "d", price: 1 });
    expect(pizzas.update).toHaveBeenCalledWith("p1", { price: 9 });
    expect(pizzas.setImagePath).toHaveBeenCalledWith("p1", "/uploads/pizzas/a.png");
  });

  it("announces a deletion and acknowledges the request", async () => {
    await expect(controller.remove({ id: "p1" })).resolves.toEqual({ ok: true });

    expect(events.emit).toHaveBeenCalledWith(EVENTS.pizzaDeleted, { pizzaId: "p1" });
  });

  describe("resolve", () => {
    it("answers in the order the ids were asked for", async () => {
      repository.findByIds.mockResolvedValue([
        pizza("p2", "Diavola", 11.9),
        pizza("p1", "Margherita", 8.5),
      ]);

      await expect(controller.resolve({ pizzaIds: ["p1", "p2"] })).resolves.toEqual([
        { pizzaId: "p1", name: "Margherita", price: 8.5, isAvailable: true },
        { pizzaId: "p2", name: "Diavola", price: 11.9, isAvailable: true },
      ]);
    });

    it("refuses when one of the pizzas is gone", async () => {
      repository.findByIds.mockResolvedValue([pizza("p1", "Margherita", 8.5)]);

      await expect(controller.resolve({ pizzaIds: ["p1", "p2"] })).rejects.toThrow(
        new NotFoundException("Pizza p2 is no longer available")
      );
    });

    it("returns the price as a number", async () => {
      repository.findByIds.mockResolvedValue([{ id: "p1", name: "M", price: "8.50" } as unknown]);

      const result = await controller.resolve({ pizzaIds: ["p1"] });

      expect(result[0].price).toBe(8.5);
    });
  });

  it("unwraps the payload of every ingredient request", async () => {
    await controller.listIngredients();
    await controller.findIngredient({ id: "i1" });
    await controller.createIngredient({ name: "Basil" });
    await controller.updateIngredient({ id: "i1", dto: { name: "Fresh" } });

    expect(ingredients.findAll).toHaveBeenCalled();
    expect(ingredients.findById).toHaveBeenCalledWith("i1");
    expect(ingredients.create).toHaveBeenCalledWith({ name: "Basil" });
    expect(ingredients.update).toHaveBeenCalledWith("i1", { name: "Fresh" });
  });

  it("acknowledges an ingredient removal", async () => {
    await expect(controller.removeIngredient({ id: "i1" })).resolves.toEqual({ ok: true });
  });

  describe("onOrderCreated", () => {
    const channelAndContext = () => {
      const channel = { ack: jest.fn(), nack: jest.fn() };
      return {
        channel,
        context: {
          getChannelRef: () => channel,
          getMessage: () => ({}),
        } as unknown as RmqContext,
      };
    };

    const event = {
      orderId: "o1",
      userId: "u1",
      userEmail: null,
      promocodeId: null,
      totalPrice: 10,
      discountAmount: 0,
      finalPrice: 10,
      items: [
        { pizzaId: "p1", pizzaName: "M", priceAtPurchase: 5, quantity: 1 },
        { pizzaId: "p2", pizzaName: "D", priceAtPurchase: 5, quantity: 1 },
      ],
      createdAt: "2026-09-01T12:00:00.000Z",
    };

    it("marks every ordered pizza with the order date", async () => {
      const { context, channel } = channelAndContext();

      await controller.onOrderCreated(event, context);

      expect(repository.markOrdered).toHaveBeenCalledWith(
        ["p1", "p2"],
        new Date("2026-09-01T12:00:00.000Z")
      );
      expect(channel.ack).toHaveBeenCalled();
    });

    it("skips items with no pizza id", async () => {
      const { context } = channelAndContext();

      await controller.onOrderCreated(
        { ...event, items: [{ ...event.items[0], pizzaId: null }] },
        context
      );

      expect(repository.markOrdered).toHaveBeenCalledWith([], expect.any(Date));
    });

    it("sends the message to the DLQ when the update fails", async () => {
      repository.markOrdered.mockRejectedValue(new Error("db down"));
      const { context, channel } = channelAndContext();

      await controller.onOrderCreated(event, context);

      expect(channel.nack).toHaveBeenCalledWith({}, false, false);
    });
  });
});
