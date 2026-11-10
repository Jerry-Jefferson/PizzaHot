import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { ClientProxy, RmqContext } from "@nestjs/microservices";
import { OrderMessagesController } from "../order.controller.ts";
import type { OrdersService } from "../orders.service.ts";
import type { IOrdersRepository } from "../order.types.ts";
import { OrderStatus } from "../constants/order-status.constant.ts";
import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";
import { EVENTS } from "../../../libs/contracts/index.ts";

type AnyMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;

function anyMock(value: unknown = undefined): AnyMock {
  return jest.fn<(...args: unknown[]) => Promise<unknown>>().mockResolvedValue(value);
}

describe("OrderMessagesController", () => {
  let orders: Record<string, AnyMock>;
  let repository: { detachUser: AnyMock };
  let events: { emit: jest.Mock<(pattern: string, data: unknown) => unknown> };
  let controller: OrderMessagesController;

  beforeEach(() => {
    orders = {
      create: anyMock({ id: "o1" }),
      findByUserId: anyMock({ data: [], total: 0 }),
      findMyOrderById: anyMock({ id: "o1" }),
      findById: anyMock({ id: "o1", userId: "u1", status: OrderStatus.PENDING }),
      findAll: anyMock({ data: [], total: 0 }),
      updateStatus: anyMock({ id: "o1", status: OrderStatus.CONFIRMED }),
    };
    repository = { detachUser: anyMock(3) };
    events = { emit: jest.fn<(pattern: string, data: unknown) => unknown>() };

    controller = new OrderMessagesController(
      orders as unknown as OrdersService,
      repository as unknown as IOrdersRepository,
      events as unknown as ClientProxy
    );
  });

  it("unwraps the payload of every request", async () => {
    const dto = { delivery: DeliveryType.PICKUP, paymentMethod: PaymentMethod.CASH };

    await controller.create({ userId: "u1", dto });
    await controller.findMineById({ userId: "u1", orderId: "o1" });
    await controller.findById({ orderId: "o1" });

    expect(orders.create).toHaveBeenCalledWith("u1", dto);
    expect(orders.findMyOrderById).toHaveBeenCalledWith("o1", "u1");
    expect(orders.findById).toHaveBeenCalledWith("o1");
  });

  it.each([
    ["findMine", (payload: { userId: string }) => controller.findMine(payload)],
    ["findByUserId", (payload: { userId: string }) => controller.findByUserId(payload)],
  ])("%s defaults the page and limit", async (_name, call) => {
    await call({ userId: "u1" });

    expect(orders.findByUserId).toHaveBeenLastCalledWith("u1", 1, 10);
  });

  it("honours an explicit page and limit", async () => {
    await controller.findMine({ userId: "u1", page: 3, limit: 5 });

    expect(orders.findByUserId).toHaveBeenCalledWith("u1", 3, 5);
  });

  it("defaults the paging of a search too", async () => {
    await controller.findAll({ status: OrderStatus.PENDING });

    expect(orders.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10, status: OrderStatus.PENDING })
    );
  });

  describe("updateStatus", () => {
    it("announces the change with both the old and the new status", async () => {
      await controller.updateStatus({ orderId: "o1", status: OrderStatus.CONFIRMED });

      expect(events.emit).toHaveBeenCalledWith(EVENTS.orderStatusChanged, {
        orderId: "o1",
        userId: "u1",
        previousStatus: OrderStatus.PENDING,
        status: OrderStatus.CONFIRMED,
      });
    });

    it("copes with an order whose user was deleted", async () => {
      orders.findById.mockResolvedValue({ id: "o1", userId: null, status: OrderStatus.PENDING });

      await controller.updateStatus({ orderId: "o1", status: OrderStatus.CONFIRMED });

      expect(events.emit).toHaveBeenCalledWith(
        EVENTS.orderStatusChanged,
        expect.objectContaining({ userId: "" })
      );
    });

    it("returns the updated order", async () => {
      await expect(
        controller.updateStatus({ orderId: "o1", status: OrderStatus.CONFIRMED })
      ).resolves.toMatchObject({ status: OrderStatus.CONFIRMED });
    });
  });

  describe("onUserDeleted", () => {
    it("detaches the orders and acknowledges", async () => {
      const channel = { ack: jest.fn(), nack: jest.fn() };
      const context = {
        getChannelRef: () => channel,
        getMessage: () => ({}),
      } as unknown as RmqContext;

      await controller.onUserDeleted({ userId: "u1", email: "a@b.c", name: null }, context);

      expect(repository.detachUser).toHaveBeenCalledWith("u1");
      expect(channel.ack).toHaveBeenCalled();
    });

    it("sends the message to the DLQ when detaching fails", async () => {
      repository.detachUser.mockRejectedValue(new Error("db down"));
      const channel = { ack: jest.fn(), nack: jest.fn() };
      const context = {
        getChannelRef: () => channel,
        getMessage: () => ({}),
      } as unknown as RmqContext;

      await controller.onUserDeleted({ userId: "u1", email: "a@b.c", name: null }, context);

      expect(channel.nack).toHaveBeenCalledWith({}, false, false);
    });
  });
});
