import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CartService } from "../carts.service.ts";
import { CartRepository } from "../carts.repository.ts";
import { CartItemsRepository } from "../cart-items.repository.ts";
import { PizzasService } from "../../pizzas/pizzas.service.ts";
import { MAX_PIZZA_QUANTITY } from "../../shared/constants/pizza.constants.ts";
import {
  mockUserId,
  mockPizzaId,
  mockCartId,
  mockCart,
  mockPizza,
  createMockCartItem,
} from "./mocks.ts";

describe("CartService", () => {
  let service: CartService;
  let cartRepository: jest.Mocked<CartRepository>;
  let cartItemsRepository: jest.Mocked<CartItemsRepository>;
  let pizzasService: jest.Mocked<PizzasService>;

  beforeEach(async () => {
    const mockCartRepo = {
      findByUserId: jest.fn(),
      findOrCreate: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const mockCartItemsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findByCartAndPizza: jest.fn(),
      removeByCartAndPizza: jest.fn(),
      removeAllByCartId: jest.fn(),
    };

    const mockPizzasServ = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: mockCartRepo },
        { provide: CartItemsRepository, useValue: mockCartItemsRepo },
        { provide: PizzasService, useValue: mockPizzasServ },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(CartRepository);
    cartItemsRepository = module.get(CartItemsRepository);
    pizzasService = module.get(PizzasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return the cart for the user via findOrCreate", async () => {
      cartRepository.findOrCreate.mockResolvedValue(mockCart);

      const result = await service.getCart(mockUserId);

      expect(cartRepository.findOrCreate).toHaveBeenCalledWith(mockUserId);
      expect(result).toBe(mockCart);
    });
  });

  describe("addItem", () => {
    it("should throw NotFoundException if pizza does not exist", async () => {
      pizzasService.findById.mockRejectedValue(new NotFoundException("Pizza not found"));

      await expect(service.addItem(mockUserId, mockPizzaId, 2)).rejects.toThrow(NotFoundException);
      expect(pizzasService.findById).toHaveBeenCalledWith(mockPizzaId);
      expect(cartRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it("should create a new cart item if pizza is not in the cart", async () => {
      pizzasService.findById.mockResolvedValue(mockPizza);
      cartRepository.findOrCreate.mockResolvedValue(mockCart);
      cartItemsRepository.findByCartAndPizza.mockResolvedValue(null);

      const createdItem = createMockCartItem({ id: "item-1", quantity: 2 });

      cartItemsRepository.create.mockReturnValue(createdItem);
      cartItemsRepository.save.mockResolvedValue(createdItem);

      const result = await service.addItem(mockUserId, mockPizzaId, 2);

      expect(pizzasService.findById).toHaveBeenCalledWith(mockPizzaId);
      expect(cartRepository.findOrCreate).toHaveBeenCalledWith(mockUserId);
      expect(cartItemsRepository.findByCartAndPizza).toHaveBeenCalledWith(mockCartId, mockPizzaId);
      expect(cartItemsRepository.create).toHaveBeenCalledWith({
        cart: { id: mockCartId },
        pizza: { id: mockPizzaId },
        quantity: 2,
      });
      expect(cartItemsRepository.save).toHaveBeenCalledWith(createdItem);
      expect(result).toBe(createdItem);
    });

    it("should increment quantity and save if pizza already exists in the cart", async () => {
      pizzasService.findById.mockResolvedValue(mockPizza);
      cartRepository.findOrCreate.mockResolvedValue(mockCart);

      const existingItem = createMockCartItem({ id: "item-1", quantity: 2 });
      cartItemsRepository.findByCartAndPizza.mockResolvedValue(existingItem);
      cartItemsRepository.save.mockImplementation((item) => Promise.resolve(item));

      const result = await service.addItem(mockUserId, mockPizzaId, 3);

      expect(cartItemsRepository.create).not.toHaveBeenCalled();
      expect(existingItem.quantity).toBe(5);
      expect(cartItemsRepository.save).toHaveBeenCalledWith(existingItem);
      expect(result.quantity).toBe(5);
    });

    it("should throw BadRequestException if new quantity exceeds MAX_PIZZA_QUANTITY", async () => {
      pizzasService.findById.mockResolvedValue(mockPizza);
      cartRepository.findOrCreate.mockResolvedValue(mockCart);

      const existingItem = createMockCartItem({ id: "item-1", quantity: MAX_PIZZA_QUANTITY });
      cartItemsRepository.findByCartAndPizza.mockResolvedValue(existingItem);

      await expect(service.addItem(mockUserId, mockPizzaId, 1)).rejects.toThrow(
        BadRequestException
      );
      expect(cartItemsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("updateItemQuantity", () => {
    it("should throw NotFoundException if cart not found", async () => {
      cartRepository.findByUserId.mockResolvedValue(null);

      await expect(service.updateItemQuantity(mockUserId, mockPizzaId, 3)).rejects.toThrow(
        new NotFoundException("Cart not found")
      );
      expect(cartItemsRepository.findByCartAndPizza).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if pizza not found in cart", async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);
      cartItemsRepository.findByCartAndPizza.mockResolvedValue(null);

      await expect(service.updateItemQuantity(mockUserId, mockPizzaId, 3)).rejects.toThrow(
        new NotFoundException("Pizza not found in cart")
      );
    });

    it("should update quantity and return saved item when quantity > 0", async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);

      const existingItem = createMockCartItem({ id: "item-1", quantity: 2 });
      cartItemsRepository.findByCartAndPizza.mockResolvedValue(existingItem);
      cartItemsRepository.save.mockImplementation((item) => Promise.resolve(item));

      const result = await service.updateItemQuantity(mockUserId, mockPizzaId, 5);

      expect(existingItem.quantity).toBe(5);
      expect(cartItemsRepository.save).toHaveBeenCalledWith(existingItem);
      expect(result).toBe(existingItem);
    });

    it("should remove item and return null when quantity is 0", async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);

      const existingItem = createMockCartItem({ id: "item-1", quantity: 2 });
      cartItemsRepository.findByCartAndPizza.mockResolvedValue(existingItem);
      cartItemsRepository.removeByCartAndPizza.mockResolvedValue(true);

      const result = await service.updateItemQuantity(mockUserId, mockPizzaId, 0);

      expect(cartItemsRepository.removeByCartAndPizza).toHaveBeenCalledWith(
        mockCartId,
        mockPizzaId
      );
      expect(cartItemsRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should clamp negative quantity to 0, remove item and return null", async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);

      const existingItem = createMockCartItem({ id: "item-1", quantity: 2 });
      cartItemsRepository.findByCartAndPizza.mockResolvedValue(existingItem);
      cartItemsRepository.removeByCartAndPizza.mockResolvedValue(true);

      const result = await service.updateItemQuantity(mockUserId, mockPizzaId, -5);

      expect(cartItemsRepository.removeByCartAndPizza).toHaveBeenCalledWith(
        mockCartId,
        mockPizzaId
      );
      expect(cartItemsRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("removeItem", () => {
    it("should throw NotFoundException if cart not found", async () => {
      cartRepository.findByUserId.mockResolvedValue(null);

      await expect(service.removeItem(mockUserId, mockPizzaId)).rejects.toThrow(
        new NotFoundException("Cart not found")
      );
      expect(cartItemsRepository.removeByCartAndPizza).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if pizza was not removed (not found in cart)", async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);
      cartItemsRepository.removeByCartAndPizza.mockResolvedValue(false);

      await expect(service.removeItem(mockUserId, mockPizzaId)).rejects.toThrow(
        new NotFoundException("Pizza not found in cart")
      );
      expect(cartItemsRepository.removeByCartAndPizza).toHaveBeenCalledWith(
        mockCartId,
        mockPizzaId
      );
    });

    it("should remove item when pizza exists in cart", async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);
      cartItemsRepository.removeByCartAndPizza.mockResolvedValue(true);

      await expect(service.removeItem(mockUserId, mockPizzaId)).resolves.toBeUndefined();
      expect(cartItemsRepository.removeByCartAndPizza).toHaveBeenCalledWith(
        mockCartId,
        mockPizzaId
      );
    });
  });

  describe("clearCart", () => {
    it("should return early if cart does not exist", async () => {
      cartRepository.findByUserId.mockResolvedValue(null);

      await service.clearCart(mockUserId);

      expect(cartItemsRepository.removeAllByCartId).not.toHaveBeenCalled();
    });

    it("should remove all items if cart exists", async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);

      await service.clearCart(mockUserId);

      expect(cartItemsRepository.removeAllByCartId).toHaveBeenCalledWith(mockCartId);
    });
  });
});
