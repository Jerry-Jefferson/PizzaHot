import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CartService } from "../carts.service.ts";
import { CartRepository } from "../carts.repository.ts";
import { CartItemsRepository } from "../cart-items.repository.ts";
import { PizzasService } from "../../pizzas/pizzas.service.ts";
import { PromocodesService } from "../../promocodes/promocodes.service.ts";
import { MAX_PIZZA_QUANTITY } from "../../shared/constants/pizza.constants.ts";
import { CartResponseDto } from "../dto/cart-response.dto.ts";
import { DiscountType } from "../../promocodes/constants/discount-type.constant.ts";
import {
  mockUserId,
  mockPizzaId,
  mockCartId,
  mockCart,
  mockPizza,
  createMockCartItem,
  mockPromocodePercentage,
  mockPromocodeFixed,
  mockPromocodeExpired,
} from "./mocks.ts";

describe("CartService", () => {
  let service: CartService;
  let cartRepository: jest.Mocked<CartRepository>;
  let cartItemsRepository: jest.Mocked<CartItemsRepository>;
  let pizzasService: jest.Mocked<PizzasService>;
  let promocodesService: jest.Mocked<PromocodesService>;

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

    const mockPromocodesServ = {
      findByCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: mockCartRepo },
        { provide: CartItemsRepository, useValue: mockCartItemsRepo },
        { provide: PizzasService, useValue: mockPizzasServ },
        { provide: PromocodesService, useValue: mockPromocodesServ },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(CartRepository);
    cartItemsRepository = module.get(CartItemsRepository);
    pizzasService = module.get(PizzasService);
    promocodesService = module.get(PromocodesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return the cart response for the user via findOrCreate", async () => {
      cartRepository.findOrCreate.mockResolvedValue(mockCart);

      const result = await service.getCart(mockUserId);

      expect(cartRepository.findOrCreate).toHaveBeenCalledWith(mockUserId);
      const pricing = service.calculatePricing(mockCart);
      expect(result).toEqual(CartResponseDto.fromEntity(mockCart, pricing));
    });
  });

  describe("calculatePricing", () => {
    it("should calculate zero totals for an empty cart without promocode", () => {
      const result = service.calculatePricing({
        ...mockCart,
        cartItems: [],
        promocode: null,
      });

      expect(result.totalPrice).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(0);
    });

    it("should calculate total price correctly without promocode", () => {
      const cart = {
        ...mockCart,
        cartItems: [
          createMockCartItem({
            pizza: { ...mockPizza, price: 12.5 },
            quantity: 2,
          }),
          createMockCartItem({
            pizza: { ...mockPizza, price: 8.25 },
            quantity: 1,
          }),
        ],
        promocode: null,
      };

      const result = service.calculatePricing(cart);

      expect(result.totalPrice).toBe(33.25);
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(33.25);
    });

    it("should calculate percentage discount correctly", () => {
      const cart = {
        ...mockCart,
        cartItems: [
          createMockCartItem({
            pizza: { ...mockPizza, price: 50.0 },
            quantity: 2,
          }),
        ],
        promocode: {
          ...mockPromocodePercentage,
          discount: 25,
          discountType: DiscountType.PERCENTAGE,
        },
      };

      const result = service.calculatePricing(cart);

      expect(result.totalPrice).toBe(100.0);
      expect(result.discountAmount).toBe(25.0);
      expect(result.finalPrice).toBe(75.0);
    });

    it("should calculate fixed amount discount correctly", () => {
      const cart = {
        ...mockCart,
        cartItems: [
          createMockCartItem({
            pizza: { ...mockPizza, price: 15.0 },
            quantity: 2,
          }),
        ],
        promocode: {
          ...mockPromocodeFixed,
          discount: 7.5,
          discountType: DiscountType.FIXED_AMOUNT,
        },
      };

      const result = service.calculatePricing(cart);

      expect(result.totalPrice).toBe(30.0);
      expect(result.discountAmount).toBe(7.5);
      expect(result.finalPrice).toBe(22.5);
    });

    it("should clamp fixed discount to total price if discount exceeds total", () => {
      const cart = {
        ...mockCart,
        cartItems: [
          createMockCartItem({
            pizza: { ...mockPizza, price: 10.0 },
            quantity: 1,
          }),
        ],
        promocode: {
          ...mockPromocodeFixed,
          discount: 25.0,
          discountType: DiscountType.FIXED_AMOUNT,
        },
      };

      const result = service.calculatePricing(cart);

      expect(result.totalPrice).toBe(10.0);
      expect(result.discountAmount).toBe(10.0);
      expect(result.finalPrice).toBe(0);
    });

    it("should not apply discount if promocode has expired", () => {
      const cart = {
        ...mockCart,
        cartItems: [
          createMockCartItem({
            pizza: { ...mockPizza, price: 20.0 },
            quantity: 2,
          }),
        ],
        promocode: mockPromocodeExpired,
      };

      const result = service.calculatePricing(cart);

      expect(result.totalPrice).toBe(40.0);
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(40.0);
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

  describe("applyPromocode", () => {
    it("should convert code to uppercase before searching", async () => {
      promocodesService.findByCode.mockResolvedValue(mockPromocodePercentage);
      cartRepository.findOrCreate.mockResolvedValue({ ...mockCart, promocode: null });
      cartRepository.save.mockImplementation((c) => Promise.resolve(c));
      cartRepository.findByUserId.mockResolvedValue({
        ...mockCart,
        promocode: mockPromocodePercentage,
      });

      await service.applyPromocode(mockUserId, "  pizza20  ");

      expect(promocodesService.findByCode).toHaveBeenCalledWith("PIZZA20");
    });

    it("should throw NotFoundException if promocode not found", async () => {
      promocodesService.findByCode.mockResolvedValue(null);

      await expect(service.applyPromocode(mockUserId, "INVALID")).rejects.toThrow(
        new NotFoundException("Promocode not found")
      );
      expect(cartRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if promocode has expired", async () => {
      promocodesService.findByCode.mockResolvedValue(mockPromocodeExpired);

      await expect(service.applyPromocode(mockUserId, "EXPIRED")).rejects.toThrow(
        new BadRequestException("Promocode has expired")
      );
      expect(cartRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if a promocode is already applied", async () => {
      promocodesService.findByCode.mockResolvedValue(mockPromocodePercentage);
      cartRepository.findOrCreate.mockResolvedValue({
        ...mockCart,
        promocode: mockPromocodeFixed,
      });

      await expect(service.applyPromocode(mockUserId, "PIZZA20")).rejects.toThrow(
        new BadRequestException("Only one promocode can be applied to the cart")
      );
      expect(cartRepository.save).not.toHaveBeenCalled();
    });

    it("should apply percentage promocode and calculate totals correctly", async () => {
      promocodesService.findByCode.mockResolvedValue(mockPromocodePercentage);

      const cartWithItems = {
        ...mockCart,
        promocode: null,
        cartItems: [
          createMockCartItem({
            id: "item-1",
            pizza: { ...mockPizza, price: 10.0 },
            quantity: 2,
          }),
        ],
      };

      cartRepository.findOrCreate.mockResolvedValue(cartWithItems);
      cartRepository.save.mockImplementation((c) => Promise.resolve(c));
      cartRepository.findByUserId.mockResolvedValue({
        ...cartWithItems,
        promocode: mockPromocodePercentage,
      });

      const result = await service.applyPromocode(mockUserId, "PIZZA20");

      expect(result.totalPrice).toBe(20.0);
      expect(result.discountAmount).toBe(4.0);
      expect(result.finalPrice).toBe(16.0);
      expect(result.promocode?.code).toBe("PIZZA20");
    });

    it("should apply fixed amount promocode and calculate totals correctly", async () => {
      promocodesService.findByCode.mockResolvedValue(mockPromocodeFixed);

      const cartWithItems = {
        ...mockCart,
        promocode: null,
        cartItems: [
          createMockCartItem({
            id: "item-1",
            pizza: { ...mockPizza, price: 10.0 },
            quantity: 2,
          }),
        ],
      };

      cartRepository.findOrCreate.mockResolvedValue(cartWithItems);
      cartRepository.save.mockImplementation((c) => Promise.resolve(c));
      cartRepository.findByUserId.mockResolvedValue({
        ...cartWithItems,
        promocode: mockPromocodeFixed,
      });

      const result = await service.applyPromocode(mockUserId, "FIXED10");

      expect(result.totalPrice).toBe(20.0);
      expect(result.discountAmount).toBe(10.0);
      expect(result.finalPrice).toBe(10.0);
      expect(result.promocode?.code).toBe("FIXED10");
    });

    it("should clamp fixed discount to total price so finalPrice does not drop below 0", async () => {
      const largeFixedPromo = {
        ...mockPromocodeFixed,
        discount: 50,
      };
      promocodesService.findByCode.mockResolvedValue(largeFixedPromo);

      const cartWithItems = {
        ...mockCart,
        promocode: null,
        cartItems: [
          createMockCartItem({
            id: "item-1",
            pizza: { ...mockPizza, price: 10.0 },
            quantity: 2,
          }),
        ],
      };

      cartRepository.findOrCreate.mockResolvedValue(cartWithItems);
      cartRepository.save.mockImplementation((c) => Promise.resolve(c));
      cartRepository.findByUserId.mockResolvedValue({
        ...cartWithItems,
        promocode: largeFixedPromo,
      });

      const result = await service.applyPromocode(mockUserId, "FIXED10");

      expect(result.totalPrice).toBe(20.0);
      expect(result.discountAmount).toBe(20.0);
      expect(result.finalPrice).toBe(0);
    });
  });

  describe("removePromocode", () => {
    it("should throw NotFoundException if cart not found", async () => {
      cartRepository.findByUserId.mockResolvedValue(null);

      await expect(service.removePromocode(mockUserId)).rejects.toThrow(
        new NotFoundException("Cart not found")
      );
    });

    it("should throw NotFoundException if no promocode applied to cart", async () => {
      cartRepository.findByUserId.mockResolvedValue({ ...mockCart, promocode: null });

      await expect(service.removePromocode(mockUserId)).rejects.toThrow(
        new NotFoundException("No promocode applied to cart")
      );
    });

    it("should remove promocode, save, and return full price without discount", async () => {
      const cartWithPromo = {
        ...mockCart,
        promocode: mockPromocodePercentage,
        cartItems: [
          createMockCartItem({
            id: "item-1",
            pizza: { ...mockPizza, price: 10.0 },
            quantity: 2,
          }),
        ],
      };

      cartRepository.findByUserId
        .mockResolvedValueOnce(cartWithPromo)
        .mockResolvedValueOnce({ ...cartWithPromo, promocode: null });
      cartRepository.save.mockImplementation((c) => Promise.resolve(c));

      const result = await service.removePromocode(mockUserId);

      expect(cartRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ promocode: null })
      );
      expect(result.promocode).toBeNull();
      expect(result.totalPrice).toBe(20.0);
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(20.0);
    });
  });
});
