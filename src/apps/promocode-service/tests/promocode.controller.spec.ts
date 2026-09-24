import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { RmqContext } from "@nestjs/microservices";
import { PromocodeMessagesController } from "../promocode.controller.ts";
import type { PromocodesService } from "../promocodes.service.ts";
import type { RedemptionsService } from "../redemptions/redemptions.service.ts";
import type { Promocode } from "../promocode.entity.ts";
import { DiscountMode } from "../../../libs/contracts/index.ts";

function promocode(overrides: Partial<Promocode> = {}): Promocode {
  return {
    id: "c1",
    code: "SALE10",
    discount: 10,
    discountMode: DiscountMode.PERCENTAGE,
    validTill: new Date("2099-01-01T00:00:00.000Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function rmqContext(): { context: RmqContext; channel: { ack: jest.Mock; nack: jest.Mock } } {
  const channel = { ack: jest.fn(), nack: jest.fn() };
  return {
    channel,
    context: {
      getChannelRef: () => channel,
      getMessage: () => ({}),
    } as unknown as RmqContext,
  };
}

describe("PromocodeMessagesController", () => {
  let promocodes: {
    findAll: jest.Mock;
    getById: jest.Mock;
    findByCode: jest.Mock;
    findByCodeOrFail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    restore: jest.Mock;
    assertNotExpired: jest.Mock;
  };
  let redemptions: {
    assertAvailableFor: jest.Mock<(userId: string, promocodeId: string) => Promise<void>>;
    reserve: jest.Mock<(userId: string, promocodeId: string) => Promise<void>>;
    confirm: jest.Mock<(userId: string, promocodeId: string, orderId: string) => Promise<void>>;
    release: jest.Mock<(userId: string, promocodeId: string) => Promise<void>>;
  };
  let controller: PromocodeMessagesController;

  beforeEach(() => {
    promocodes = {
      findAll: jest.fn(),
      getById: jest.fn(),
      findByCode: jest.fn(),
      findByCodeOrFail: jest.fn<() => Promise<Promocode>>().mockResolvedValue(promocode()),
      findById: jest.fn<() => Promise<Promocode>>().mockResolvedValue(promocode()),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      restore: jest.fn(),
      assertNotExpired: jest.fn(),
    };
    redemptions = {
      assertAvailableFor: jest
        .fn<(userId: string, promocodeId: string) => Promise<void>>()
        .mockResolvedValue(undefined),
      reserve: jest
        .fn<(userId: string, promocodeId: string) => Promise<void>>()
        .mockResolvedValue(undefined),
      confirm: jest
        .fn<(userId: string, promocodeId: string, orderId: string) => Promise<void>>()
        .mockResolvedValue(undefined),
      release: jest
        .fn<(userId: string, promocodeId: string) => Promise<void>>()
        .mockResolvedValue(undefined),
    };

    controller = new PromocodeMessagesController(
      promocodes as unknown as PromocodesService,
      redemptions as unknown as RedemptionsService
    );
  });

  it("delegates the simple reads and writes", async () => {
    await controller.list();
    await controller.findById({ id: "c1" });
    await controller.findByCode({ code: "SALE10" });
    await controller.restore({ id: "c1" });

    expect(promocodes.findAll).toHaveBeenCalled();
    expect(promocodes.getById).toHaveBeenCalledWith("c1");
    expect(promocodes.findByCode).toHaveBeenCalledWith("SALE10");
    expect(promocodes.restore).toHaveBeenCalledWith("c1");
  });

  it("unwraps the id and dto of an update", async () => {
    await controller.update({
      id: "c1",
      dto: {
        code: "SALE10",
        discount: 20,
        validTill: new Date("2099-01-01T00:00:00.000Z"),
        discountMode: DiscountMode.PERCENTAGE,
      },
    });

    expect(promocodes.update).toHaveBeenCalledWith("c1", {
      code: "SALE10",
      discount: 20,
      validTill: new Date("2099-01-01T00:00:00.000Z"),
      discountMode: DiscountMode.PERCENTAGE,
    });
  });

  it("answers a removal with an acknowledgement object", async () => {
    await expect(controller.remove({ id: "c1" })).resolves.toEqual({ ok: true });
  });

  describe("checkAvailable", () => {
    it("checks the date and the redemption before answering", async () => {
      const result = await controller.checkAvailable({ userId: "u1", code: "SALE10" });

      expect(promocodes.assertNotExpired).toHaveBeenCalled();
      expect(redemptions.assertAvailableFor).toHaveBeenCalledWith("u1", "c1");
      expect(result).toEqual({
        id: "c1",
        code: "SALE10",
        discount: 10,
        discountMode: DiscountMode.PERCENTAGE,
        validTill: "2099-01-01T00:00:00.000Z",
      });
    });

    it("sends the date as an ISO string", async () => {
      const result = await controller.checkAvailable({ userId: "u1", code: "SALE10" });

      expect(typeof result.validTill).toBe("string");
    });
  });

  describe("reserve", () => {
    it("reserves before answering", async () => {
      const result = await controller.reserve({ userId: "u1", promocodeId: "c1" });

      expect(redemptions.reserve).toHaveBeenCalledWith("u1", "c1");
      expect(result.promocode.code).toBe("SALE10");
    });

    it("does not reserve an expired code", async () => {
      promocodes.assertNotExpired.mockImplementation(() => {
        throw new Error("Promocode has expired");
      });

      await expect(controller.reserve({ userId: "u1", promocodeId: "c1" })).rejects.toThrow();
      expect(redemptions.reserve).not.toHaveBeenCalled();
    });
  });

  describe("onOrderCreated", () => {
    const event = {
      orderId: "o1",
      userId: "u1",
      userEmail: null,
      promocodeId: "c1",
      totalPrice: 10,
      discountAmount: 1,
      finalPrice: 9,
      items: [],
      createdAt: new Date().toISOString(),
    };

    it("confirms the reservation and acknowledges", async () => {
      const { context, channel } = rmqContext();

      await controller.onOrderCreated(event, context);

      expect(redemptions.confirm).toHaveBeenCalledWith("u1", "c1", "o1");
      expect(channel.ack).toHaveBeenCalled();
    });

    it("acknowledges an order that used no promocode", async () => {
      const { context, channel } = rmqContext();

      await controller.onOrderCreated({ ...event, promocodeId: null }, context);

      expect(redemptions.confirm).not.toHaveBeenCalled();
      expect(channel.ack).toHaveBeenCalled();
    });

    it("sends the message to the DLQ when confirming fails", async () => {
      redemptions.confirm.mockRejectedValue(new Error("row gone"));
      const { context, channel } = rmqContext();

      await controller.onOrderCreated(event, context);

      expect(channel.nack).toHaveBeenCalledWith({}, false, false);
    });
  });

  describe("onOrderFailed", () => {
    it("releases the reservation", async () => {
      const { context, channel } = rmqContext();

      await controller.onOrderFailed(
        { orderId: "", userId: "u1", promocodeId: "c1", reason: "db down" },
        context
      );

      expect(redemptions.release).toHaveBeenCalledWith("u1", "c1");
      expect(channel.ack).toHaveBeenCalled();
    });

    it("does nothing when no promocode was involved", async () => {
      const { context } = rmqContext();

      await controller.onOrderFailed(
        { orderId: "", userId: "u1", promocodeId: null, reason: "empty cart" },
        context
      );

      expect(redemptions.release).not.toHaveBeenCalled();
    });
  });

  it("creates from the payload as sent", async () => {
    const dto = {
      code: "NEW",
      discount: 5,
      discountMode: DiscountMode.FIXED_AMOUNT,
      validTill: new Date(),
    };

    await controller.create(dto);

    expect(promocodes.create).toHaveBeenCalledWith(dto);
  });
});
