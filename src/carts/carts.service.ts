import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CartRepository } from "./carts.repository.ts";
import { CartItemsRepository } from "./cart-items.repository.ts";
import { PizzasService } from "../pizzas/pizzas.service.ts";
import { PromocodesService } from "../promocodes/promocodes.service.ts";
import { CartResponseDto } from "./dto/cart-response.dto.ts";
import { CartItem } from "./entities/cart-item.entity.ts";
import { Cart } from "./entities/cart.entity.ts";
import { MAX_PIZZA_QUANTITY } from "../shared/constants/pizza.constants.ts";
import { calculatePricing } from "../pricing/pricing.ts";

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemsRepository: CartItemsRepository,
    private readonly pizzasService: PizzasService,
    private readonly promocodesService: PromocodesService
  ) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findOrCreate(userId);

    const pricing = calculatePricing(cart);

    return CartResponseDto.fromEntity(cart, pricing);
  }

  async getCartEntity(userId: string): Promise<Cart | null> {
    return this.cartRepository.findByUserId(userId);
  }

  async applyPromocode(userId: string, code: string): Promise<CartResponseDto> {
    const formattedCode = code.trim().toUpperCase();

    const promocode = await this.promocodesService.findByCode(formattedCode);

    if (!promocode) {
      throw new NotFoundException("Promocode not found");
    }

    if (new Date(promocode.validTill) < new Date()) {
      throw new BadRequestException("Promocode has expired");
    }

    const cart = await this.cartRepository.findOrCreate(userId);

    if (cart.promocode) {
      throw new BadRequestException("Only one promocode can be applied to the cart");
    }

    cart.promocode = promocode;

    await this.cartRepository.save(cart);

    const updatedCart = await this.cartRepository.findByUserId(userId);

    const resultCart = updatedCart ?? cart;
    const pricing = calculatePricing(resultCart);

    return CartResponseDto.fromEntity(resultCart, pricing);
  }

  async removePromocode(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    if (!cart.promocode) {
      throw new NotFoundException("No promocode applied to cart");
    }

    cart.promocode = null;

    await this.cartRepository.save(cart);

    const updatedCart = await this.cartRepository.findByUserId(userId);

    const resultCart = updatedCart ?? cart;
    const pricing = calculatePricing(resultCart);

    return CartResponseDto.fromEntity(resultCart, pricing);
  }

  async addItem(userId: string, pizzaId: string, quantity: number): Promise<CartItem> {
    await this.pizzasService.findById(pizzaId);

    const cart = await this.cartRepository.findOrCreate(userId);

    const existingItem = await this.cartItemsRepository.findByCartAndPizza(cart.id, pizzaId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > MAX_PIZZA_QUANTITY) {
        throw new BadRequestException(
          `Quantity cannot exceed ${MAX_PIZZA_QUANTITY} (current: ${existingItem.quantity})`
        );
      }

      existingItem.quantity = newQuantity;

      return this.cartItemsRepository.save(existingItem);
    }

    const cartItem = this.cartItemsRepository.create({
      cart: { id: cart.id },
      pizza: { id: pizzaId },
      quantity,
    });

    return this.cartItemsRepository.save(cartItem);
  }

  async updateItemQuantity(
    userId: string,
    pizzaId: string,
    quantity: number
  ): Promise<CartItem | null> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    const cartItem = await this.cartItemsRepository.findByCartAndPizza(cart.id, pizzaId);

    if (!cartItem) {
      throw new NotFoundException("Pizza not found in cart");
    }

    const clampedQuantity = Math.max(0, quantity);

    if (clampedQuantity === 0) {
      await this.cartItemsRepository.removeByCartAndPizza(cart.id, pizzaId);

      return null;
    }

    if (clampedQuantity > MAX_PIZZA_QUANTITY) {
      throw new BadRequestException(`Quantity cannot exceed ${MAX_PIZZA_QUANTITY}`);
    }

    cartItem.quantity = clampedQuantity;

    return this.cartItemsRepository.save(cartItem);
  }

  async removeItem(userId: string, pizzaId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    const removed = await this.cartItemsRepository.removeByCartAndPizza(cart.id, pizzaId);

    if (!removed) {
      throw new NotFoundException("Pizza not found in cart");
    }
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return;
    }

    await this.cartItemsRepository.removeAllByCartId(cart.id);
  }
}
