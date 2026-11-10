import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { of, throwError } from "rxjs";
import type { ClientProxy } from "@nestjs/microservices";
import { OrdersService } from "../orders.service.ts";
import type { IOrderItemsRepository, IOrdersRepository } from "../order.types.ts";
import type { Order } from "../order.entity.ts";
import { OrderStatus } from "../constants/order-status.constant.ts";
import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";
import { DiscountMode, EVENTS, RPC } from "../../../libs/contracts/index.ts";
import { MAX_PIZZA_QUANTITY } from "../../../libs/contracts/order-limit.constant.ts";

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: "o1",
    userId: "u1",
    promocodeId: null,
    codeApplied: null,
    address: "",
    delivery: DeliveryType.PICKUP,
    paymentMethod: PaymentMethod.CASH,
    totalPrice: 17,
    discountAmount: 0,
    finalPrice: 17,
    status: OrderStatus.PENDING,
    comment: null,
    orderItems: [],
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

const CHECKOUT_DTO = { delivery: DeliveryType.PICKUP, paymentMethod: PaymentMethod.CASH };

const SNAPSHOT = {
  cartId: "cart-1",
  promocodeId: null,
  items: [{ pizzaId: "p1", quantity: 2 }],
};

const RESOLVED = [{ pizzaId: "p1", name: "Margherita", price: 8.5, isAvailable: true }];

describe("OrdersService", () => {
  let orders: { [K in keyof IOrdersRepository]: jest.Mock<IOrdersRepository[K]> };
  let items: { [K in keyof IOrderItemsRepository]: jest.Mock<IOrderItemsRepository[K]> };
  let answers: Map<string, unknown>;
  let failing: Map<string, unknown>;
  let events: { emit: jest.Mock<(pattern: string, data: unknown) => unknown> };
  let service: OrdersService;

  function proxy(): ClientProxy {
    return {
      send: jest.fn((pattern: string) => {
        if (failing.has(pattern)) return throwError(() => failing.get(pattern));
        return of(answers.get(pattern));
      }),
    } as unknown as ClientProxy;
  }

  beforeEach(() => {
    answers = new Map<string, unknown>([
      [RPC.cart.checkoutSnapshot, SNAPSHOT],
      [RPC.catalog.pizzaResolve, RESOLVED],
    ]);
    failing = new Map<string, unknown>();

    orders = {
      create: jest.fn<IOrdersRepository["create"]>().mockImplementation((data) => data as Order),
      save: jest.fn<IOrdersRepository["save"]>().mockResolvedValue(order()),
      findById: jest.fn<IOrdersRepository["findById"]>().mockResolvedValue(order()),
      findByUserId: jest.fn<IOrdersRepository["findByUserId"]>(),
      findPaginated: jest.fn<IOrdersRepository["findPaginated"]>(),
      updateStatus: jest.fn<IOrdersRepository["updateStatus"]>().mockResolvedValue(true),
      detachUser: jest.fn<IOrdersRepository["detachUser"]>(),
      countByRole: undefined as never,
    } as never;

    items = {
      create: jest.fn<IOrderItemsRepository["create"]>().mockImplementation((d) => d as never),
      save: jest.fn<IOrderItemsRepository["save"]>(),
      saveMany: jest.fn<IOrderItemsRepository["saveMany"]>().mockResolvedValue([]),
      findByOrderId: jest.fn<IOrderItemsRepository["findByOrderId"]>(),
      deleteByOrderId: jest.fn<IOrderItemsRepository["deleteByOrderId"]>(),
    };

    events = { emit: jest.fn() };

    service = new OrdersService(
      orders,
      items,
      proxy(),
      proxy(),
      proxy(),
      events as unknown as ClientProxy
    );
  });

  describe("create", () => {
    it("prices the order from the catalog, not from the cart", async () => {
      await service.create("u1", CHECKOUT_DTO);

      expect(orders.create).toHaveBeenCalledWith(
        expect.objectContaining({ totalPrice: 17, discountAmount: 0, finalPrice: 17 })
      );
    });

    it("stores the name and price as they were at purchase", async () => {
      await service.create("u1", CHECKOUT_DTO);

      expect(items.create).toHaveBeenCalledWith(
        expect.objectContaining({ pizzaName: "Margherita", priceAtPurchase: 8.5, quantity: 2 })
      );
    });

    it("announces the order so the cart and analytics can react", async () => {
      await service.create("u1", CHECKOUT_DTO);

      expect(events.emit).toHaveBeenCalledWith(
        EVENTS.orderCreated,
        expect.objectContaining({ orderId: "o1", userId: "u1", finalPrice: 17 })
      );
    });

    it("refuses when the user has no cart", async () => {
      answers.set(RPC.cart.checkoutSnapshot, { cartId: null, promocodeId: null, items: [] });

      await expect(service.create("u1", CHECKOUT_DTO)).rejects.toThrow(
        new NotFoundException("No cart")
      );
    });

    it("refuses an empty cart", async () => {
      answers.set(RPC.cart.checkoutSnapshot, { cartId: "c1", promocodeId: null, items: [] });

      await expect(service.create("u1", CHECKOUT_DTO)).rejects.toThrow(
        new BadRequestException("Cart is empty")
      );
    });

    it("refuses a quantity over the limit", async () => {
      answers.set(RPC.cart.checkoutSnapshot, {
        cartId: "c1",
        promocodeId: null,
        items: [{ pizzaId: "p1", quantity: MAX_PIZZA_QUANTITY + 1 }],
      });

      await expect(service.create("u1", CHECKOUT_DTO)).rejects.toThrow(BadRequestException);
    });

    it("refuses a pizza the catalog no longer resolves", async () => {
      answers.set(RPC.catalog.pizzaResolve, []);

      await expect(service.create("u1", CHECKOUT_DTO)).rejects.toThrow(
        /Pizza "p1" is no longer available/
      );
    });

    it("refuses a pizza the catalog marks unavailable", async () => {
      answers.set(RPC.catalog.pizzaResolve, [{ ...RESOLVED[0], isAvailable: false }]);

      await expect(service.create("u1", CHECKOUT_DTO)).rejects.toThrow(BadRequestException);
    });

    describe("with a promocode", () => {
      beforeEach(() => {
        answers.set(RPC.cart.checkoutSnapshot, { ...SNAPSHOT, promocodeId: "c1" });
        answers.set(RPC.promocode.reserve, {
          promocode: {
            id: "c1",
            code: "SALE10",
            discount: 10,
            discountMode: DiscountMode.PERCENTAGE,
            validTill: "2099-01-01T00:00:00.000Z",
          },
        });
      });

      it("applies the reserved discount", async () => {
        await service.create("u1", CHECKOUT_DTO);

        expect(orders.create).toHaveBeenCalledWith(
          expect.objectContaining({ totalPrice: 17, discountAmount: 1.7, finalPrice: 15.3 })
        );
      });

      it("records which code was used", async () => {
        await service.create("u1", CHECKOUT_DTO);

        expect(orders.create).toHaveBeenCalledWith(
          expect.objectContaining({ promocodeId: "c1", codeApplied: "SALE10" })
        );
      });

      it("stops the checkout when the reservation is refused", async () => {
        failing.set(RPC.promocode.reserve, {
          __rpc: true,
          status: 409,
          message: "Already used",
          error: "Conflict",
        });
        service = new OrdersService(
          orders,
          items,
          proxy(),
          proxy(),
          proxy(),
          events as unknown as ClientProxy
        );

        await expect(service.create("u1", CHECKOUT_DTO)).rejects.toThrow("Already used");
        expect(orders.save).not.toHaveBeenCalled();
      });
    });

    it("announces a failure when writing the order breaks", async () => {
      orders.save.mockRejectedValue(new Error("deadlock"));

      await expect(service.create("u1", CHECKOUT_DTO)).rejects.toThrow("deadlock");
      expect(events.emit).toHaveBeenCalledWith(
        EVENTS.orderFailed,
        expect.objectContaining({ userId: "u1" })
      );
      expect(events.emit).not.toHaveBeenCalledWith(EVENTS.orderCreated, expect.anything());
    });

    it("throws when the saved order cannot be read back", async () => {
      orders.findById.mockResolvedValue(null);

      await expect(service.create("u1", CHECKOUT_DTO)).rejects.toThrow(
        new NotFoundException("Created order was not found")
      );
    });
  });

  describe("findMyOrderById", () => {
    it("returns the order to its owner", async () => {
      orders.findById.mockResolvedValue(order({ userId: "u1" }));

      await expect(service.findMyOrderById("o1", "u1")).resolves.toMatchObject({ id: "o1" });
    });

    it("hides someone else's order behind a 404", async () => {
      orders.findById.mockResolvedValue(order({ userId: "someone-else" }));

      await expect(service.findMyOrderById("o1", "u1")).rejects.toThrow(NotFoundException);
    });

    it("throws for an unknown id", async () => {
      orders.findById.mockResolvedValue(null);

      await expect(service.findMyOrderById("nope", "u1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByUserId", () => {
    it("builds a page from the repository result", async () => {
      orders.findPaginated.mockResolvedValue({ data: [order()], total: 3 });

      const result = await service.findByUserId("u1", 1, 2);

      expect(orders.findPaginated).toHaveBeenCalledWith({ page: 1, limit: 2, userId: "u1" });
      expect(result).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
    });

    it("defaults to the first page of ten", async () => {
      orders.findPaginated.mockResolvedValue({ data: [], total: 0 });

      await service.findByUserId("u1");

      expect(orders.findPaginated).toHaveBeenCalledWith({ page: 1, limit: 10, userId: "u1" });
    });
  });

  describe("findAll", () => {
    it("passes the query straight through", async () => {
      orders.findPaginated.mockResolvedValue({ data: [order()], total: 1 });
      const query = { page: 1, limit: 10, status: OrderStatus.PENDING };

      const result = await service.findAll(query);

      expect(orders.findPaginated).toHaveBeenCalledWith(query);
      expect(result.total).toBe(1);
    });
  });

  describe("updateStatus", () => {
    it("writes the new status and returns the fresh order", async () => {
      orders.findById
        .mockResolvedValueOnce(order({ status: OrderStatus.PENDING }))
        .mockResolvedValueOnce(order({ status: OrderStatus.CONFIRMED }));

      const result = await service.updateStatus("o1", OrderStatus.CONFIRMED);

      expect(orders.updateStatus).toHaveBeenCalledWith("o1", OrderStatus.CONFIRMED);
      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });

    it("throws for an unknown order", async () => {
      orders.findById.mockResolvedValue(null);

      await expect(service.updateStatus("nope", OrderStatus.CONFIRMED)).rejects.toThrow(
        NotFoundException
      );
      expect(orders.updateStatus).not.toHaveBeenCalled();
    });

    it("throws when the order vanishes between the write and the read", async () => {
      orders.findById.mockResolvedValueOnce(order()).mockResolvedValueOnce(null);

      await expect(service.updateStatus("o1", OrderStatus.CONFIRMED)).rejects.toThrow(
        new NotFoundException("Updated order was not found")
      );
    });
  });
});
