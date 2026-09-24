import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CartService } from "../carts.service.ts";
import { PizzaSnapshotRepository } from "../snapshots/pizza-snapshot.repository.ts";
import { PROMOCODE_CLIENT } from "../../../libs/messaging/tokens.constant.ts";
import { RPC, DiscountMode } from "../../../libs/contracts/index.ts";
import type { Cart } from "../cart.entity.ts";
import type { Promocode } from "../../promocode-service/promocode.entity.ts";
import { of, throwError } from "rxjs";
import { MAX_PIZZA_QUANTITY } from "../../../libs/contracts/order-limit.constant.ts";
import { CartResponseDto } from "../dto/cart-response.dto.ts";
import { CartItemResponseDto } from "../cart-items/dto/cart-item-response.dto.ts";
import { priceCart } from "../../../libs/price-calculation/price-calculation.ts";
import { CART_REPOSITORY, CART_ITEMS_REPOSITORY } from "../../../libs/database/tokens.ts";
import type { ICartRepository } from "../cart.types.ts";
import type { ICartItemsRepository } from "../cart.types.ts";
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

const withPromocode = (cart: Cart, promocode: Promocode): Cart => ({
  ...cart,
  promocodeId: promocode.id,
  promocodeCode: promocode.code,
  promocodeDiscount: promocode.discount,
  promocodeDiscountMode: promocode.discountMode,
  promocodeValidTill: promocode.validTill,
});

const noPromocode = {
  promocodeId: null,
  promocodeCode: null,
  promocodeDiscount: null,
  promocodeDiscountMode: null,
  promocodeValidTill: null,
};

describe("CartService", () => {
  let service: CartService;
  let cartRepository: jest.Mocked<ICartRepository>;
  let cartItemsRepository: jest.Mocked<ICartItemsRepository>;
  let pizzasService: jest.Mocked<PizzaSnapshotRepository>;
  let promocodeClient: { send: jest.Mock };

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

    const mockPromocodeClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CART_REPOSITORY, useValue: mockCartRepo },
        { provide: CART_ITEMS_REPOSITORY, useValue: mockCartItemsRepo },
        { provide: PizzaSnapshotRepository, useValue: mockPizzasServ },
        { provide: PROMOCODE_CLIENT, useValue: mockPromocodeClient },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(CART_REPOSITORY);
    cartItemsRepository = module.get(CART_ITEMS_REPOSITORY);
    pizzasService = module.get(PizzaSnapshotRepository);
    promocodeClient = module.get(PROMOCODE_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return the cart response for the user via findOrCreate", async () => {
      cartRepository.findOrCreate.mockResolvedValue(mockCart);

      const result = await service.getCart(mockUserId);

      expect(cartRepository.findOrCreate).toHaveBeenCalledWith(mockUserId);
      const pricing = priceCart(mockCart);
      expect(result).toEqual(CartResponseDto.fromEntity(mockCart, pricing));
    });
  });

  describe("getCartEntity", () => {
    it("should return the cart entity for the user via findByUserId", async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);

      const result = await service.getCartEntity(mockUserId);

      expect(cartRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockCart);
    });

    it("should return null if cart not found", async () => {
      cartRepository.findByUserId.mockResolvedValue(null);

      const result = await service.getCartEntity(mockUserId);

      expect(cartRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result).toBeNull();
    });
  });

  describe("priceCart", () => {
    it("should calculate zero totals for an empty cart without promocode", () => {
      const result = priceCart({
        ...mockCart,
        cartItems: [],
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
      };

      const result = priceCart(cart);

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
        promocodeId: mockPromocodePercentage.id,
        promocodeCode: mockPromocodePercentage.code,
        promocodeDiscount: 25,
        promocodeDiscountMode: DiscountMode.PERCENTAGE,
        promocodeValidTill: mockPromocodePercentage.validTill,
      };

      const result = priceCart(cart);

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
        promocodeId: mockPromocodeFixed.id,
        promocodeCode: mockPromocodeFixed.code,
        promocodeDiscount: 7.5,
        promocodeDiscountMode: DiscountMode.FIXED_AMOUNT,
        promocodeValidTill: mockPromocodeFixed.validTill,
      };

      const result = priceCart(cart);

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
        promocodeId: mockPromocodeFixed.id,
        promocodeCode: mockPromocodeFixed.code,
        promocodeDiscount: 25.0,
        promocodeDiscountMode: DiscountMode.FIXED_AMOUNT,
        promocodeValidTill: mockPromocodeFixed.validTill,
      };

      const result = priceCart(cart);

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
        promocodeId: mockPromocodeExpired.id,
        promocodeCode: mockPromocodeExpired.code,
        promocodeDiscount: mockPromocodeExpired.discount,
        promocodeDiscountMode: mockPromocodeExpired.discountMode,
        promocodeValidTill: mockPromocodeExpired.validTill,
      };

      const result = priceCart(cart);

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
      const createdItem = createMockCartItem({ id: "item-1", quantity: 2 });

      cartItemsRepository.findByCartAndPizza
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createdItem);

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
      expect(result).toEqual(CartItemResponseDto.fromEntity(createdItem));
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
      expect(result).toEqual(CartItemResponseDto.fromEntity(existingItem));
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

    it("should detach the promocode so it cannot survive into the next cart", async () => {
      const cartWithPromocode = {
        ...mockCart,
        promocodeId: mockPromocodePercentage.id,
        promocodeCode: mockPromocodePercentage.code,
        promocodeDiscount: mockPromocodePercentage.discount,
        promocodeDiscountMode: mockPromocodePercentage.discountMode,
        promocodeValidTill: mockPromocodePercentage.validTill,
      };
      cartRepository.findByUserId.mockResolvedValue(cartWithPromocode);

      await service.clearCart(mockUserId);

      expect(cartRepository.save).toHaveBeenCalled();
      const saved = cartRepository.save.mock.calls[0][0];
      expect(saved.promocodeId).toBeNull();
      expect(saved.promocodeCode).toBeNull();
      expect(saved.promocodeDiscount).toBeNull();
      expect(saved.promocodeDiscountMode).toBeNull();
      expect(saved.promocodeValidTill).toBeNull();
    });

    it("should not touch the cart row when no promocode is applied", async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);

      await service.clearCart(mockUserId);

      expect(cartRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("applyPromocode", () => {
    const availablePromocode = {
      id: mockPromocodePercentage.id,
      code: mockPromocodePercentage.code,
      discount: mockPromocodePercentage.discount,
      discountMode: mockPromocodePercentage.discountMode,
      validTill: mockPromocodePercentage.validTill.toISOString(),
    };

    it("should normalize the code before asking promocode-service", async () => {
      promocodeClient.send.mockReturnValue(of(availablePromocode));
      cartRepository.findOrCreate.mockResolvedValue({ ...mockCart });
      cartRepository.save.mockImplementation((c) => Promise.resolve(c));
      cartRepository.findByUserId.mockResolvedValue(
        withPromocode(mockCart, mockPromocodePercentage)
      );

      await service.applyPromocode(mockUserId, "  pizza20  ");

      expect(promocodeClient.send).toHaveBeenCalledWith(RPC.promocode.checkAvailable, {
        userId: mockUserId,
        code: "PIZZA20",
      });
    });

    it("should surface the failure from promocode-service without touching the cart", async () => {
      promocodeClient.send.mockReturnValue(
        throwError(() => ({ __rpc: true, status: 400, message: "Promocode has expired" }))
      );

      await expect(service.applyPromocode(mockUserId, "EXPIRED")).rejects.toThrow(
        "Promocode has expired"
      );
      expect(cartRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if a promocode is already applied", async () => {
      promocodeClient.send.mockReturnValue(of(availablePromocode));
      cartRepository.findOrCreate.mockResolvedValue(withPromocode(mockCart, mockPromocodeFixed));

      await expect(service.applyPromocode(mockUserId, "PIZZA20")).rejects.toThrow(
        new BadRequestException("Only one promocode can be applied to the cart")
      );
      expect(cartRepository.save).not.toHaveBeenCalled();
    });

    it("should snapshot the promocode onto the cart and price it", async () => {
      promocodeClient.send.mockReturnValue(of(availablePromocode));

      const cart = {
        ...mockCart,
        cartItems: [createMockCartItem({ pizza: { ...mockPizza, price: 50.0 }, quantity: 2 })],
      };
      cartRepository.findOrCreate.mockResolvedValue(cart);
      cartRepository.save.mockImplementation((c) => Promise.resolve(c));
      cartRepository.findByUserId.mockResolvedValue({
        ...cart,
        promocodeId: availablePromocode.id,
        promocodeCode: availablePromocode.code,
        promocodeDiscount: 20,
        promocodeDiscountMode: DiscountMode.PERCENTAGE,
        promocodeValidTill: mockPromocodePercentage.validTill,
      });

      const result = await service.applyPromocode(mockUserId, "PIZZA20");

      expect(cartRepository.save).toHaveBeenCalled();
      expect(result.totalPrice).toBe(100.0);
      expect(result.discountAmount).toBe(20.0);
      expect(result.finalPrice).toBe(80.0);
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
      cartRepository.findByUserId.mockResolvedValue({ ...mockCart });

      await expect(service.removePromocode(mockUserId)).rejects.toThrow(
        new NotFoundException("No promocode applied to cart")
      );
    });

    it("should clear every snapshotted promocode column and return the full price", async () => {
      const cart = {
        ...withPromocode(mockCart, mockPromocodePercentage),
        cartItems: [createMockCartItem({ pizza: { ...mockPizza, price: 25.0 }, quantity: 2 })],
      };
      cartRepository.findByUserId
        .mockResolvedValueOnce(cart)
        .mockResolvedValueOnce({ ...cart, ...noPromocode });
      cartRepository.save.mockImplementation((c) => Promise.resolve(c));

      const result = await service.removePromocode(mockUserId);

      const saved = cartRepository.save.mock.calls[0][0];
      expect(saved.promocodeId).toBeNull();
      expect(saved.promocodeCode).toBeNull();
      expect(saved.promocodeDiscount).toBeNull();
      expect(saved.promocodeDiscountMode).toBeNull();
      expect(saved.promocodeValidTill).toBeNull();

      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(50.0);
    });
  });
});
