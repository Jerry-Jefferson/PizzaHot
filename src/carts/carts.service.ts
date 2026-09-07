import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { CartRepository } from "./carts.repository.ts";
import { CartItemsRepository } from "./cart-items.repository.ts";
import { PizzasService } from "../pizzas/pizzas.service.ts";
import { Cart } from "./entities/cart.entity.ts";
import { CartItem } from "./entities/cart-item.entity.ts";
import { MAX_PIZZA_QUANTITY } from "../shared/constants/pizza.constants.ts";

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemsRepository: CartItemsRepository,
    private readonly pizzasService: PizzasService
  ) {}

  async getCart(userId: string): Promise<Cart> {
    return this.cartRepository.findOrCreate(userId);
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
