import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { RmqContext } from "@nestjs/microservices";
import { CartMessagesController } from "../cart.controller.ts";
import type { CartService } from "../carts.service.ts";
import type { PizzaSnapshotRepository } from "../snapshots/pizza-snapshot.repository.ts";

type AnyMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;

function anyMock(value: unknown = undefined): AnyMock {
  return jest.fn<(...args: unknown[]) => Promise<unknown>>().mockResolvedValue(value);
}

function rmqContext(): { context: RmqContext; channel: { ack: jest.Mock; nack: jest.Mock } } {
  const channel = { ack: jest.fn(), nack: jest.fn() };
  return {
    channel,
    context: { getChannelRef: () => channel, getMessage: () => ({}) } as unknown as RmqContext,
  };
}

const UPSERTED = {
  pizzaId: "p1",
  name: "Margherita",
  price: 8.5,
  image: null,
  isAvailable: true,
};

describe("CartMessagesController", () => {
  let cart: Record<string, AnyMock>;
  let snapshots: Record<string, AnyMock>;
  let controller: CartMessagesController;

  beforeEach(() => {
    cart = {
      getCart: anyMock({ id: "c1" }),
      getCartEntity: anyMock(null),
      addItem: anyMock({}),
      updateItemQuantity: anyMock({}),
      removeItem: anyMock(undefined),
      clearCart: anyMock(undefined),
      applyPromocode: anyMock({}),
      removePromocode: anyMock({}),
      detachUser: anyMock(undefined),
      detachPromocode: anyMock(undefined),
      clearAfterCheckout: anyMock(undefined),
    };
    snapshots = { upsert: anyMock(undefined), remove: anyMock(undefined) };

    controller = new CartMessagesController(
      cart as unknown as CartService,
      snapshots as unknown as PizzaSnapshotRepository
    );
  });

  it("unwraps the payload of every request", async () => {
    await controller.get({ userId: "u1" });
    await controller.addItem({ userId: "u1", pizzaId: "p1", quantity: 2 });
    await controller.updateItemQuantity({ userId: "u1", pizzaId: "p1", quantity: 3 });
    await controller.applyPromocode({ userId: "u1", code: "SALE" });
    await controller.removePromocode({ userId: "u1" });

    expect(cart.getCart).toHaveBeenCalledWith("u1");
    expect(cart.addItem).toHaveBeenCalledWith("u1", "p1", 2);
    expect(cart.updateItemQuantity).toHaveBeenCalledWith("u1", "p1", 3);
    expect(cart.applyPromocode).toHaveBeenCalledWith("u1", "SALE");
    expect(cart.removePromocode).toHaveBeenCalledWith("u1");
  });

  it("answers the two void handlers with an acknowledgement object", async () => {
    await expect(controller.removeItem({ userId: "u1", pizzaId: "p1" })).resolves.toEqual({
      ok: true,
    });
    await expect(controller.clear({ userId: "u1" })).resolves.toEqual({ ok: true });
  });

  describe("checkoutSnapshot", () => {
    it("answers with an empty cartId when the user has no cart", async () => {
      cart.getCartEntity.mockResolvedValue(null);

      await expect(controller.checkoutSnapshot({ userId: "u1" })).resolves.toEqual({
        cartId: "",
        promocodeId: null,
        items: [],
      });
    });

    it("reduces the cart to ids and quantities", async () => {
      cart.getCartEntity.mockResolvedValue({
        id: "c1",
        promocodeId: "promo-1",
        cartItems: [
          { pizza: { id: "p1" }, quantity: 2 },
          { pizza: { id: "p2" }, quantity: 1 },
        ],
      });

      await expect(controller.checkoutSnapshot({ userId: "u1" })).resolves.toEqual({
        cartId: "c1",
        promocodeId: "promo-1",
        items: [
          { pizzaId: "p1", quantity: 2 },
          { pizzaId: "p2", quantity: 1 },
        ],
      });
    });

    it("copes with a cart that has no items loaded", async () => {
      cart.getCartEntity.mockResolvedValue({ id: "c1", promocodeId: null });

      await expect(controller.checkoutSnapshot({ userId: "u1" })).resolves.toMatchObject({
        items: [],
      });
    });
  });

  describe("pizza events", () => {
    it.each([
      ["onPizzaCreated", (context: RmqContext) => controller.onPizzaCreated(UPSERTED, context)],
      ["onPizzaUpdated", (context: RmqContext) => controller.onPizzaUpdated(UPSERTED, context)],
    ])("%s writes the snapshot", async (_name, call) => {
      const { context, channel } = rmqContext();

      await call(context);

      expect(snapshots.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ id: "p1", name: "Margherita", price: 8.5 })
      );
      expect(channel.ack).toHaveBeenCalled();
    });

    it("removes the snapshot when the pizza is deleted", async () => {
      const { context, channel } = rmqContext();

      await controller.onPizzaDeleted({ pizzaId: "p1" }, context);

      expect(snapshots.remove).toHaveBeenCalledWith("p1");
      expect(channel.ack).toHaveBeenCalled();
    });

    it("sends the message to the DLQ when the write fails", async () => {
      snapshots.upsert.mockRejectedValue(new Error("db down"));
      const { context, channel } = rmqContext();

      await controller.onPizzaCreated(UPSERTED, context);

      expect(channel.nack).toHaveBeenCalledWith({}, false, false);
    });
  });
});
