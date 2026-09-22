import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { BadRequestException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";
import { PizzasController } from "../controllers/pizzas/pizzas.controller.ts";
import { IngredientsController } from "../controllers/ingredients/ingredients.controller.ts";
import { CartController } from "../controllers/carts/carts.controller.ts";
import { OrdersController } from "../controllers/orders/orders.controller.ts";
import { UsersController } from "../controllers/users/users.controller.ts";
import { PromocodesController } from "../controllers/promocodes/promocodes.controller.ts";
import { AnalyticsController } from "../controllers/analytics/analytics.controller.ts";
import { LogsController } from "../controllers/logs/logs.controller.ts";
import { AuthController } from "../controllers/auth/auth.controller.ts";
import type { CatalogClient } from "../clients/catalog.client.ts";
import type { CartClient } from "../clients/cart.client.ts";
import type { OrderClient } from "../clients/order.client.ts";
import type { IdentityClient } from "../clients/identity.client.ts";
import type { PromocodeClient } from "../clients/promocode.client.ts";
import type { AnalyticsClient, LogClient } from "../clients/analytics.client.ts";
import type { JwtPayload } from "../../../libs/auth/jwt-payload.schema.ts";
import { COOKIE_NAME, Role } from "../../../libs/auth/auth.constant.ts";
import { OrderStatus } from "../../order-service/constants/order-status.constant.ts";
import { DeliveryType } from "../../order-service/constants/delivery-type.constant.ts";
import { PaymentMethod } from "../../order-service/constants/payment-method.constant.ts";

const USER: JwtPayload = {
  sub: "u1",
  email: "anna@example.com",
  role: Role.USER,
  isEmailVerified: true,
};

const FILE = { filename: "abc.png" } as Express.Multer.File;

type ClientMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;

function clientWith<T extends string>(...methods: T[]): Record<T, ClientMock> {
  const client = {} as Record<T, ClientMock>;
  for (const method of methods) {
    client[method] = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValue({ ok: true });
  }
  return client;
}

describe("PizzasController", () => {
  let client: Record<string, ClientMock>;
  let controller: PizzasController;

  beforeEach(() => {
    client = clientWith("findAll", "findById", "create", "update", "setImagePath", "remove");
    controller = new PizzasController(client as unknown as CatalogClient);
  });

  it("passes pagination through", async () => {
    await controller.findAll({ page: 2, limit: 5, search: "marg" });

    expect(client.findAll).toHaveBeenCalledWith(2, 5, "marg");
  });

  it("delegates the single reads and writes", async () => {
    await controller.findOne("p1");
    await controller.addPizza({ name: "X", description: "d", price: 1 });
    await controller.remove("p1");

    expect(client.findById).toHaveBeenCalledWith("p1");
    expect(client.create).toHaveBeenCalledWith({ name: "X", description: "d", price: 1 });
    expect(client.remove).toHaveBeenCalledWith("p1");
  });

  it("refuses an update with no fields", async () => {
    await expect(controller.update("p1", {})).rejects.toThrow(BadRequestException);
    expect(client.update).not.toHaveBeenCalled();
  });

  it("accepts an update that changes something", async () => {
    await controller.update("p1", { price: 9 });

    expect(client.update).toHaveBeenCalledWith("p1", { price: 9 });
  });

  it("builds the stored path from the category and the generated filename", async () => {
    await controller.uploadImage("p1", FILE);

    expect(client.setImagePath).toHaveBeenCalledWith("p1", "/uploads/pizzas/abc.png");
  });
});

describe("IngredientsController", () => {
  let client: Record<string, ClientMock>;
  let controller: IngredientsController;

  beforeEach(() => {
    client = clientWith(
      "findAllIngredients",
      "findIngredientById",
      "createIngredient",
      "updateIngredient",
      "removeIngredient"
    );
    controller = new IngredientsController(client as unknown as CatalogClient);
  });

  it("delegates every call", async () => {
    await controller.findAll();
    await controller.findOne("i1");
    await controller.create({ name: "Basil" });
    await controller.update("i1", { name: "Fresh Basil" });
    await controller.remove("i1");

    expect(client.findAllIngredients).toHaveBeenCalled();
    expect(client.findIngredientById).toHaveBeenCalledWith("i1");
    expect(client.createIngredient).toHaveBeenCalledWith({ name: "Basil" });
    expect(client.updateIngredient).toHaveBeenCalledWith("i1", { name: "Fresh Basil" });
    expect(client.removeIngredient).toHaveBeenCalledWith("i1");
  });
});

describe("CartController", () => {
  let client: Record<string, ClientMock>;
  let controller: CartController;

  beforeEach(() => {
    client = clientWith(
      "getCart",
      "applyPromocode",
      "removePromocode",
      "addItem",
      "updateItemQuantity",
      "removeItem",
      "clearCart"
    );
    controller = new CartController(client as unknown as CartClient);
  });

  it("takes the user from the token, never from the request body", async () => {
    await controller.getCart(USER);
    await controller.clearCart(USER);
    await controller.removePromocode(USER);

    expect(client.getCart).toHaveBeenCalledWith("u1");
    expect(client.clearCart).toHaveBeenCalledWith("u1");
    expect(client.removePromocode).toHaveBeenCalledWith("u1");
  });

  it("delegates item changes", async () => {
    await controller.addItem(USER, { pizzaId: "p1", quantity: 2 });
    await controller.removeItem(USER, "p1");
    await controller.applyPromocode(USER, { code: "SALE" });

    expect(client.addItem).toHaveBeenCalledWith("u1", "p1", 2);
    expect(client.removeItem).toHaveBeenCalledWith("u1", "p1");
    expect(client.applyPromocode).toHaveBeenCalledWith("u1", "SALE");
  });

  describe("updateItemQuantity", () => {
    it("answers 204 when the item is gone", async () => {
      client.updateItemQuantity.mockResolvedValue(null);
      const res = { status: jest.fn() };

      const result = await controller.updateItemQuantity(
        USER,
        "p1",
        { quantity: 0 },
        res as unknown as Pick<Response, "status">
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(result).toBeUndefined();
    });

    it("returns the item when one remains", async () => {
      client.updateItemQuantity.mockResolvedValue({ quantity: 3 });
      const res = { status: jest.fn() };

      const result = await controller.updateItemQuantity(
        USER,
        "p1",
        { quantity: 3 },
        res as unknown as Pick<Response, "status">
      );

      expect(res.status).not.toHaveBeenCalled();
      expect(result).toEqual({ quantity: 3 });
    });
  });
});

describe("OrdersController", () => {
  let client: Record<string, ClientMock>;
  let controller: OrdersController;

  beforeEach(() => {
    client = clientWith(
      "create",
      "findByUserId",
      "findMyOrderById",
      "findAll",
      "findById",
      "updateStatus"
    );
    controller = new OrdersController(client as unknown as OrderClient);
  });

  it("creates for the user in the token", async () => {
    const dto = { delivery: DeliveryType.PICKUP, paymentMethod: PaymentMethod.CASH };

    await controller.create(USER, dto);

    expect(client.create).toHaveBeenCalledWith("u1", dto);
  });

  it("reads the caller's own orders", async () => {
    await controller.getMyOrders(USER, { page: 1, limit: 10 });
    await controller.getMyOrderById(USER, "o1");

    expect(client.findByUserId).toHaveBeenCalledWith("u1", 1, 10);
    expect(client.findMyOrderById).toHaveBeenCalledWith("o1", "u1");
  });

  it("passes an admin search straight to the client", async () => {
    const query = { page: 1, limit: 10, status: OrderStatus.PENDING };

    await controller.searchOrders(query);

    expect(client.findAll).toHaveBeenCalledWith(query);
  });

  it("reads another user's orders by id", async () => {
    await controller.getOrdersByUser("u2", { page: 2, limit: 5 });
    await controller.getOrderById("o1");
    await controller.updateStatus("o1", { status: OrderStatus.CONFIRMED });

    expect(client.findByUserId).toHaveBeenCalledWith("u2", 2, 5);
    expect(client.findById).toHaveBeenCalledWith("o1");
    expect(client.updateStatus).toHaveBeenCalledWith("o1", OrderStatus.CONFIRMED);
  });
});

describe("UsersController", () => {
  let client: Record<string, ClientMock>;
  let controller: UsersController;

  beforeEach(() => {
    client = clientWith(
      "findAll",
      "findById",
      "setRole",
      "update",
      "setImage",
      "changePassword",
      "remove"
    );
    controller = new UsersController(client as unknown as IdentityClient);
  });

  it("delegates the admin reads", async () => {
    await controller.findAll({ page: 1, limit: 10, search: "anna" });
    await controller.findOne("u2");

    expect(client.findAll).toHaveBeenCalledWith(1, 10, "anna");
    expect(client.findById).toHaveBeenCalledWith("u2");
  });

  it("passes the acting user when changing a role", async () => {
    await controller.updateRole(USER, "u2", { role: Role.ADMIN });

    expect(client.setRole).toHaveBeenCalledWith("u2", Role.ADMIN, "u1");
  });

  it("edits only the caller's own account", async () => {
    await controller.updateMe(USER, { name: "Anna" });
    await controller.changePassword(USER, { currentPassword: "a", newPassword: "b" });

    expect(client.update).toHaveBeenCalledWith("u1", { name: "Anna" });
    expect(client.changePassword).toHaveBeenCalledWith("u1", {
      currentPassword: "a",
      newPassword: "b",
    });
  });

  it("builds the avatar path from the users category", async () => {
    await controller.uploadAvatar(USER, FILE);

    expect(client.setImage).toHaveBeenCalledWith("u1", "/uploads/users/abc.png");
  });

  it("clears the cookie when the account is deleted", async () => {
    const res = { clearCookie: jest.fn() };

    await controller.removeMe(USER, res as unknown as Response);

    expect(client.remove).toHaveBeenCalledWith("u1");
    expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME);
  });
});

describe("PromocodesController", () => {
  let client: Record<string, ClientMock>;
  let controller: PromocodesController;

  beforeEach(() => {
    client = clientWith("findAll", "findById", "create", "update", "remove", "restore");
    controller = new PromocodesController(client as unknown as PromocodeClient);
  });

  it("delegates every call", async () => {
    await controller.findAll();
    await controller.findOne("c1");
    await controller.update("c1", { discount: 5 });
    await controller.remove("c1");
    await controller.restore("c1");

    expect(client.findAll).toHaveBeenCalled();
    expect(client.findById).toHaveBeenCalledWith("c1");
    expect(client.update).toHaveBeenCalledWith("c1", { discount: 5 });
    expect(client.remove).toHaveBeenCalledWith("c1");
    expect(client.restore).toHaveBeenCalledWith("c1");
  });
});

describe("AnalyticsController", () => {
  it("passes the month and year, and asks for the checks", async () => {
    const client: Record<string, ClientMock> = clientWith(
      "getMostOrderedPizzaInMonth",
      "getUsersWithAboveAverageCheck"
    );
    const controller = new AnalyticsController(client as unknown as AnalyticsClient);

    await controller.getMostOrderedPizza({ month: 9, year: 2026 });
    await controller.getUsersAboveAverageCheck();

    expect(client.getMostOrderedPizzaInMonth).toHaveBeenCalledWith(9, 2026);
    expect(client.getUsersWithAboveAverageCheck).toHaveBeenCalled();
  });
});

describe("LogsController", () => {
  it("passes the whole query object", async () => {
    const client: Record<string, ClientMock> = clientWith("findAll");
    const controller = new LogsController(client as unknown as LogClient);
    const query = { page: 1, limit: 10 };

    await controller.getLogs(query);

    expect(client.findAll).toHaveBeenCalledWith(query);
  });
});

describe("AuthController", () => {
  let client: Record<string, ClientMock>;
  let controller: AuthController;
  let res: { cookie: jest.Mock; clearCookie: jest.Mock };

  beforeEach(() => {
    client = clientWith(
      "register",
      "login",
      "verifyEmailAccept",
      "verifyEmailDecline",
      "getProfile"
    );
    client.register.mockResolvedValue({ token: "t", user: { id: "u1" } });
    client.login.mockResolvedValue({ token: "t", user: { id: "u1" } });
    controller = new AuthController(client as unknown as IdentityClient);
    res = { cookie: jest.fn(), clearCookie: jest.fn() };
  });

  it.each([
    [
      "signup",
      async () =>
        controller.signup(
          { email: "a@b.c", password: "p", confirmPassword: "p" },
          res as unknown as Response
        ),
    ],
    [
      "login",
      async () => controller.login({ email: "a@b.c", password: "p" }, res as unknown as Response),
    ],
  ])("%s sets an httpOnly cookie and returns the token", async (_name, call) => {
    const result = await call();

    expect(res.cookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      "t",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" })
    );
    expect(result).toMatchObject({ accessToken: "t" });
  });

  it("verifies and declines by token", async () => {
    await controller.verifyEmailAccept("tok");
    await controller.verifyEmailDecline("tok");

    expect(client.verifyEmailAccept).toHaveBeenCalledWith("tok");
    expect(client.verifyEmailDecline).toHaveBeenCalledWith("tok");
  });

  it("reads the profile of the user in the token", async () => {
    await controller.getMe(USER);

    expect(client.getProfile).toHaveBeenCalledWith("u1");
  });

  it("clears the cookie on logout", () => {
    controller.logout(res as unknown as Response);

    expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME);
  });
});
