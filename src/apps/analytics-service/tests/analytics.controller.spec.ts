import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { RmqContext } from "@nestjs/microservices";
import { AnalyticsMessagesController } from "../analytics.controller.ts";
import type { AnalyticsService } from "../analytics.service.ts";
import type { AnalyticsReadModelRepository } from "../analytics.repository.ts";
import { OrderStatus } from "../../order-service/constants/order-status.constant.ts";

function rmqContext(): { context: RmqContext; channel: { ack: jest.Mock; nack: jest.Mock } } {
  const channel = { ack: jest.fn(), nack: jest.fn() };
  return {
    channel,
    context: { getChannelRef: () => channel, getMessage: () => ({}) } as unknown as RmqContext,
  };
}

const ORDER_CREATED = {
  orderId: "o1",
  userId: "u1",
  userEmail: "anna@example.com",
  promocodeId: null,
  totalPrice: 20,
  discountAmount: 0,
  finalPrice: 20,
  items: [{ pizzaId: "p1", pizzaName: "Margherita", priceAtPurchase: 10, quantity: 2 }],
  createdAt: "2026-09-01T12:00:00.000Z",
};

type AnyMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;

describe("AnalyticsMessagesController", () => {
  let analytics: Record<string, AnyMock>;
  let readModel: Record<string, AnyMock>;
  let controller: AnalyticsMessagesController;

  beforeEach(() => {
    analytics = {
      getMostOrderedPizzaInMonth: jest
        .fn<(...args: unknown[]) => Promise<unknown>>()
        .mockResolvedValue(null),
      getUsersWithAboveAverageCheck: jest
        .fn<(...args: unknown[]) => Promise<unknown>>()
        .mockResolvedValue([]),
    };
    readModel = {
      upsertOrderFact: jest
        .fn<(...args: unknown[]) => Promise<unknown>>()
        .mockResolvedValue(undefined),
      upsertOrderItemFacts: jest
        .fn<(...args: unknown[]) => Promise<unknown>>()
        .mockResolvedValue(undefined),
      setOrderStatus: jest
        .fn<(...args: unknown[]) => Promise<unknown>>()
        .mockResolvedValue(undefined),
      upsertUserFact: jest
        .fn<(...args: unknown[]) => Promise<unknown>>()
        .mockResolvedValue(undefined),
      markUserDeleted: jest
        .fn<(...args: unknown[]) => Promise<unknown>>()
        .mockResolvedValue(undefined),
    };

    controller = new AnalyticsMessagesController(
      analytics as unknown as AnalyticsService,
      readModel as unknown as AnalyticsReadModelRepository
    );
  });

  it("answers the two queries from the service", async () => {
    await controller.popularPizza({ month: 9, year: 2026 });
    await controller.highestChecks();

    expect(analytics.getMostOrderedPizzaInMonth).toHaveBeenCalledWith(9, 2026);
    expect(analytics.getUsersWithAboveAverageCheck).toHaveBeenCalled();
  });

  describe("onOrderCreated", () => {
    it("records the order and its items", async () => {
      const { context, channel } = rmqContext();

      await controller.onOrderCreated(ORDER_CREATED, context);

      expect(readModel.upsertOrderFact).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: "o1", userId: "u1", finalPrice: 20, status: "pending" })
      );
      expect(readModel.upsertOrderItemFacts).toHaveBeenCalledWith([
        expect.objectContaining({ orderId: "o1", pizzaId: "p1", quantity: 2 }),
      ]);
      expect(channel.ack).toHaveBeenCalled();
    });

    it("turns the timestamp back into a Date", async () => {
      const { context } = rmqContext();

      await controller.onOrderCreated(ORDER_CREATED, context);

      const fact = readModel.upsertOrderFact.mock.calls[0][0] as { createdAt: Date };
      expect(fact.createdAt).toBeInstanceOf(Date);
      expect(fact.createdAt.toISOString()).toBe(ORDER_CREATED.createdAt);
    });

    it("sends the message to the DLQ when the write fails", async () => {
      readModel.upsertOrderFact.mockRejectedValue(new Error("db down"));
      const { context, channel } = rmqContext();

      await controller.onOrderCreated(ORDER_CREATED, context);

      expect(channel.nack).toHaveBeenCalledWith({}, false, false);
    });
  });

  it("records a status change", async () => {
    const { context, channel } = rmqContext();

    await controller.onOrderStatusChanged(
      {
        orderId: "o1",
        userId: "u1",
        previousStatus: OrderStatus.PENDING,
        status: OrderStatus.CONFIRMED,
      },
      context
    );

    expect(readModel.setOrderStatus).toHaveBeenCalledWith("o1", OrderStatus.CONFIRMED);
    expect(channel.ack).toHaveBeenCalled();
  });

  it("records a registration", async () => {
    const { context } = rmqContext();

    await controller.onUserRegistered(
      { userId: "u1", email: "anna@example.com", name: "Anna", verificationToken: "t" },
      context
    );

    expect(readModel.upsertUserFact).toHaveBeenCalledWith({
      userId: "u1",
      email: "anna@example.com",
      name: "Anna",
      isDeleted: false,
    });
  });

  it("marks a deleted user instead of dropping the row", async () => {
    const { context } = rmqContext();

    await controller.onUserDeleted({ userId: "u1", email: "a@b.c", name: null }, context);

    expect(readModel.markUserDeleted).toHaveBeenCalledWith("u1");
  });
});
