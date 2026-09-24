import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { of } from "rxjs";
import type { ClientProxy } from "@nestjs/microservices";
import { RPC } from "../../../libs/contracts/index.ts";
import { CatalogClient } from "../clients/catalog.client.ts";
import { CartClient } from "../clients/cart.client.ts";
import { IdentityClient } from "../clients/identity.client.ts";
import { OrderClient } from "../clients/order.client.ts";
import { PromocodeClient } from "../clients/promocode.client.ts";
import { AnalyticsClient } from "../clients/analytics.client.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";
import { OrderStatus } from "../../order-service/constants/order-status.constant.ts";

describe("gateway clients", () => {
  let send: jest.Mock<(pattern: string, data: unknown) => ReturnType<ClientProxy["send"]>>;
  let proxy: ClientProxy;

  beforeEach(() => {
    send = jest.fn(() => of({ data: [], total: 0 }) as never);
    proxy = { send } as unknown as ClientProxy;
  });

  function lastCall(): [string, unknown] {
    const call = send.mock.calls.at(-1);
    if (!call) throw new Error("the client never sent anything");
    return [call[0], call[1]];
  }

  describe("CatalogClient", () => {
    let client: CatalogClient;
    beforeEach(() => (client = new CatalogClient(proxy)));

    it("wraps the pizza page in a PaginatedResponseDto", async () => {
      send.mockReturnValue(of({ data: [{ id: "p1" }], total: 25 }));

      const result = await client.findAll(2, 10, "marg");

      expect(lastCall()).toEqual([RPC.catalog.pizzaList, { page: 2, limit: 10, search: "marg" }]);
      expect(result).toMatchObject({ page: 2, limit: 10, total: 25, totalPages: 3 });
    });

    it.each([
      ["findById", () => client.findById("p1"), RPC.catalog.pizzaFindById, { id: "p1" }],
      ["remove", () => client.remove("p1"), RPC.catalog.pizzaRemove, { id: "p1" }],
      [
        "setImagePath",
        () => client.setImagePath("p1", "/uploads/pizzas/a.png"),
        RPC.catalog.pizzaSetImage,
        { id: "p1", imagePath: "/uploads/pizzas/a.png" },
      ],
      [
        "update",
        () =>
          client.update("p1", {
            name: "Margherita",
            description: "Classic",
            price: 9,
            ingredientIds: [],
          }),
        RPC.catalog.pizzaUpdate,
        {
          id: "p1",
          dto: { name: "Margherita", description: "Classic", price: 9, ingredientIds: [] },
        },
      ],
      ["findAllIngredients", () => client.findAllIngredients(), RPC.catalog.ingredientList, {}],
      [
        "findIngredientById",
        () => client.findIngredientById("i1"),
        RPC.catalog.ingredientFindById,
        { id: "i1" },
      ],
      [
        "removeIngredient",
        () => client.removeIngredient("i1"),
        RPC.catalog.ingredientRemove,
        { id: "i1" },
      ],
      [
        "updateIngredient",
        () => client.updateIngredient("i1", { name: "Basil" }),
        RPC.catalog.ingredientUpdate,
        { id: "i1", dto: { name: "Basil" } },
      ],
    ])("%s addresses the right handler", async (_name, call, pattern, payload) => {
      await call();
      expect(lastCall()).toEqual([pattern, payload]);
    });

    it("sends a create payload unwrapped", async () => {
      await client.create({ name: "X", description: "d", price: 1 });

      expect(lastCall()).toEqual([
        RPC.catalog.pizzaCreate,
        { name: "X", description: "d", price: 1 },
      ]);
    });

    it("sends an ingredient create payload unwrapped", async () => {
      await client.createIngredient({ name: "Basil" });

      expect(lastCall()).toEqual([RPC.catalog.ingredientCreate, { name: "Basil" }]);
    });
  });

  describe("CartClient", () => {
    let client: CartClient;
    beforeEach(() => (client = new CartClient(proxy)));

    it.each([
      ["getCart", () => client.getCart("u1"), RPC.cart.get, { userId: "u1" }],
      [
        "addItem",
        () => client.addItem("u1", "p1", 2),
        RPC.cart.addItem,
        { userId: "u1", pizzaId: "p1", quantity: 2 },
      ],
      [
        "updateItemQuantity",
        () => client.updateItemQuantity("u1", "p1", 3),
        RPC.cart.updateItemQuantity,
        { userId: "u1", pizzaId: "p1", quantity: 3 },
      ],
      [
        "removeItem",
        () => client.removeItem("u1", "p1"),
        RPC.cart.removeItem,
        { userId: "u1", pizzaId: "p1" },
      ],
      ["clearCart", () => client.clearCart("u1"), RPC.cart.clear, { userId: "u1" }],
      [
        "applyPromocode",
        () => client.applyPromocode("u1", "SALE"),
        RPC.cart.applyPromocode,
        { userId: "u1", code: "SALE" },
      ],
      [
        "removePromocode",
        () => client.removePromocode("u1"),
        RPC.cart.removePromocode,
        { userId: "u1" },
      ],
    ])("%s addresses the right handler", async (_name, call, pattern, payload) => {
      await call();
      expect(lastCall()).toEqual([pattern, payload]);
    });
  });

  describe("IdentityClient", () => {
    let client: IdentityClient;
    beforeEach(() => (client = new IdentityClient(proxy)));

    it.each([
      ["getProfile", () => client.getProfile("u1"), RPC.identity.findById, { id: "u1" }],
      ["findById", () => client.findById("u1"), RPC.identity.findById, { id: "u1" }],
      [
        "verifyEmailAccept",
        () => client.verifyEmailAccept("tok"),
        RPC.identity.verifyEmail,
        { token: "tok" },
      ],
      [
        "verifyEmailDecline",
        () => client.verifyEmailDecline("tok"),
        RPC.identity.declineEmail,
        { token: "tok" },
      ],
      [
        "setImage",
        () => client.setImage("u1", "/uploads/users/a.png"),
        RPC.identity.setImage,
        { userId: "u1", imagePath: "/uploads/users/a.png" },
      ],
      [
        "setRole",
        () => client.setRole("u2", Role.ADMIN, "u1"),
        RPC.identity.setRole,
        { id: "u2", role: Role.ADMIN, actingUserId: "u1" },
      ],
      ["remove", () => client.remove("u1"), RPC.identity.deleteMe, { userId: "u1" }],
    ])("%s addresses the right handler", async (_name, call, pattern, payload) => {
      await call();
      expect(lastCall()).toEqual([pattern, payload]);
    });

    it("forwards the page the identity service built", async () => {
      const page = { data: [{ id: "u1" }], page: 1, limit: 2, total: 4, totalPages: 2 };
      send.mockReturnValue(of(page));

      await expect(client.findAll(1, 2, undefined)).resolves.toEqual(page);
      expect(lastCall()).toEqual([RPC.identity.findAll, { page: 1, limit: 2, search: undefined }]);
    });
  });

  describe("OrderClient", () => {
    let client: OrderClient;
    beforeEach(() => (client = new OrderClient(proxy)));

    it("sends the whole query object for a search", async () => {
      send.mockReturnValue(of({ data: [], total: 0 }));

      const result = await client.findAll({ page: 1, limit: 10, status: OrderStatus.PENDING });

      expect(lastCall()).toEqual([
        RPC.order.findAll,
        { page: 1, limit: 10, status: OrderStatus.PENDING },
      ]);
      expect(result).toMatchObject({ page: 1, limit: 10, total: 0 });
    });

    it.each([
      [
        "create",
        () => client.create("u1", { delivery: "pickup", paymentMethod: "cash" }),
        RPC.order.create,
        { userId: "u1", dto: { delivery: "pickup", paymentMethod: "cash" } },
      ],
      [
        "updateStatus",
        () => client.updateStatus("o1", OrderStatus.CONFIRMED),
        RPC.order.updateStatus,
        { orderId: "o1", status: OrderStatus.CONFIRMED },
      ],
      ["findById", () => client.findById("o1"), RPC.order.findById, { orderId: "o1" }],
    ])("%s addresses the right handler", async (_name, call, pattern, payload) => {
      await call();
      expect(lastCall()).toEqual([pattern, payload]);
    });
  });

  describe("PromocodeClient", () => {
    let client: PromocodeClient;
    beforeEach(() => (client = new PromocodeClient(proxy)));

    it.each([
      ["findAll", () => client.findAll(), RPC.promocode.list, {}],
      ["findById", () => client.findById("c1"), RPC.promocode.findById, { id: "c1" }],
      ["remove", () => client.remove("c1"), RPC.promocode.remove, { id: "c1" }],
      ["restore", () => client.restore("c1"), RPC.promocode.restore, { id: "c1" }],
    ])("%s addresses the right handler", async (_name, call, pattern, payload) => {
      await call();
      expect(lastCall()).toEqual([pattern, payload]);
    });
  });

  describe("AnalyticsClient", () => {
    it("passes the month and year through", async () => {
      const client = new AnalyticsClient(proxy);

      await client.getMostOrderedPizzaInMonth(9, 2026);

      expect(lastCall()).toEqual([RPC.analytics.popularPizza, { month: 9, year: 2026 }]);
    });

    it("asks for the highest checks with no arguments", async () => {
      const client = new AnalyticsClient(proxy);

      await client.getUsersWithAboveAverageCheck();

      expect(lastCall()).toEqual([RPC.analytics.highestChecks, {}]);
    });
  });
});
