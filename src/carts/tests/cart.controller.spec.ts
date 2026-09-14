import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus } from "@nestjs/common";
import { CartController } from "../carts.controller.ts";
import { CartService } from "../carts.service.ts";
import type { JwtPayload } from "../../auth/types/jwt-payload.interface.ts";
import { Role } from "../../shared/constants/role.enum.ts";
import type { Response } from "express";
import { mockUser, mockPizzaId, mockCartResponse, mockCartItem } from "./mocks.ts";

describe("CartController", () => {
  let controller: CartController;
  let cartService: jest.Mocked<CartService>;

  beforeEach(async () => {
    const mockService = {
      getCart: jest.fn(),
      addItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      applyPromocode: jest.fn(),
      removePromocode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockService }],
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return the cart for the authenticated user", async () => {
      cartService.getCart.mockResolvedValue(mockCartResponse);

      const result = await controller.getCart(mockUser);

      expect(cartService.getCart).toHaveBeenCalledWith(mockUser.sub);
      expect(result).toBe(mockCartResponse);
    });
  });

  describe("addItem", () => {
    it("should add pizza to cart with specified quantity", async () => {
      cartService.addItem.mockResolvedValue(mockCartItem);

      const dto = { pizzaId: mockPizzaId, quantity: 3 };
      const result = await controller.addItem(mockUser, dto);

      expect(cartService.addItem).toHaveBeenCalledWith(mockUser.sub, mockPizzaId, 3);
      expect(result).toBe(mockCartItem);
    });

    it("should default quantity to 1 if not provided in dto", async () => {
      cartService.addItem.mockResolvedValue(mockCartItem);

      const dto = { pizzaId: mockPizzaId, quantity: undefined };
      const result = await controller.addItem(mockUser, dto);

      expect(cartService.addItem).toHaveBeenCalledWith(mockUser.sub, mockPizzaId, 1);
      expect(result).toBe(mockCartItem);
    });
  });

  describe("updateItemQuantity", () => {
    it("should update quantity and return updated item when quantity > 0", async () => {
      cartService.updateItemQuantity.mockResolvedValue(mockCartItem);
      const mockRes = { status: jest.fn() } as unknown as Response;

      const dto = { quantity: 4 };
      const result = await controller.updateItemQuantity(mockUser, mockPizzaId, dto, mockRes);

      expect(cartService.updateItemQuantity).toHaveBeenCalledWith(mockUser.sub, mockPizzaId, 4);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(result).toBe(mockCartItem);
    });

    it("should set HTTP status 204 and return undefined when item is deleted (service returns null)", async () => {
      cartService.updateItemQuantity.mockResolvedValue(null);
      const mockRes = { status: jest.fn() } as unknown as Response;

      const dto = { quantity: 0 };
      const result = await controller.updateItemQuantity(mockUser, mockPizzaId, dto, mockRes);

      expect(cartService.updateItemQuantity).toHaveBeenCalledWith(mockUser.sub, mockPizzaId, 0);
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(result).toBeUndefined();
    });
  });

  describe("removeItem", () => {
    it("should remove pizza from the authenticated user's cart", async () => {
      cartService.removeItem.mockResolvedValue();

      await controller.removeItem(mockUser, mockPizzaId);

      expect(cartService.removeItem).toHaveBeenCalledWith(mockUser.sub, mockPizzaId);
    });
  });

  describe("clearCart", () => {
    it("should clear all items from the authenticated user's cart", async () => {
      cartService.clearCart.mockResolvedValue();

      await controller.clearCart(mockUser);

      expect(cartService.clearCart).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe("applyPromocode", () => {
    it("should apply promocode for the authenticated user", async () => {
      cartService.applyPromocode.mockResolvedValue(mockCartResponse);

      const dto = { code: "PIZZA20" };
      const result = await controller.applyPromocode(mockUser, dto);

      expect(cartService.applyPromocode).toHaveBeenCalledWith(mockUser.sub, "PIZZA20");
      expect(result).toBe(mockCartResponse);
    });
  });

  describe("removePromocode", () => {
    it("should remove promocode for the authenticated user", async () => {
      cartService.removePromocode.mockResolvedValue(mockCartResponse);

      const result = await controller.removePromocode(mockUser);

      expect(cartService.removePromocode).toHaveBeenCalledWith(mockUser.sub);
      expect(result).toBe(mockCartResponse);
    });
  });

  describe("User isolation", () => {
    it("should only operate on the authenticated user ID and not allow cross-user access", async () => {
      const otherUser: JwtPayload = {
        sub: "other-user-456",
        email: "other@example.com",
        role: Role.USER,
        isEmailVerified: true,
      };

      cartService.getCart.mockResolvedValue({
        ...mockCartResponse,
        id: "other-cart",
      });

      await controller.getCart(otherUser);

      expect(cartService.getCart).toHaveBeenCalledWith("other-user-456");
      expect(cartService.getCart).not.toHaveBeenCalledWith(mockUser.sub);
    });
  });
});
