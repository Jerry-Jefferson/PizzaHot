import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { CART_REPOSITORY, CART_ITEMS_REPOSITORY } from "../../../libs/common/database/tokens.ts";
import type { ICartRepository } from "./interfaces/carts.repository.interface.ts";
import type { ICartItemsRepository } from "./interfaces/cart-items.repository.interface.ts";
import { PROMOCODE_CLIENT } from "../../../libs/messaging/tokens.ts";
import { RPC } from "../../../libs/contracts/patterns.ts";
import { rpc } from "../../../libs/messaging/rpc.util.ts";
import { PizzaSnapshotRepository } from "../snapshots/pizza-snapshot.repository.ts";
import { CartResponseDto } from "./dto/cart-response.dto.ts";
import { CartItem } from "./entities/cart-item.entity.ts";
import { Cart } from "./entities/cart.entity.ts";
import { MAX_PIZZA_QUANTITY } from "../../../libs/common/constants/pizza.constants.ts";
import { priceCart } from "../pricing/pricing.ts";
import type { DiscountType } from "../../promocode-service/promocodes/constants/discount-type.constant.ts";

interface AvailablePromocode {
  id: string;
  code: string;
  discount: number;
  discountType: DiscountType;
  validTill: string;
}

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(CART_ITEMS_REPOSITORY)
    private readonly cartItemsRepository: ICartItemsRepository,
    private readonly pizzaSnapshots: PizzaSnapshotRepository,
    @Inject(PROMOCODE_CLIENT)
    private readonly promocodeClient: ClientProxy
  ) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findOrCreate(userId);

    return CartResponseDto.fromEntity(cart, priceCart(cart));
  }

  async getCartEntity(userId: string): Promise<Cart | null> {
    return this.cartRepository.findByUserId(userId);
  }

  async applyPromocode(userId: string, code: string): Promise<CartResponseDto> {
    const promocode = await rpc<AvailablePromocode>(
      this.promocodeClient,
      RPC.promocode.checkAvailable,
      { userId, code: code.trim().toUpperCase() }
    );

    const cart = await this.cartRepository.findOrCreate(userId);

    if (cart.promocodeId) {
      throw new BadRequestException("Only one promocode can be applied to the cart");
    }

    cart.promocodeId = promocode.id;
    cart.promocodeCode = promocode.code;
    cart.promocodeDiscount = Number(promocode.discount);
    cart.promocodeDiscountType = promocode.discountType;
    cart.promocodeValidTill = new Date(promocode.validTill);

    await this.cartRepository.save(cart);

    const updatedCart = (await this.cartRepository.findByUserId(userId)) ?? cart;

    return CartResponseDto.fromEntity(updatedCart, priceCart(updatedCart));
  }

  async removePromocode(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    if (!cart.promocodeId) {
      throw new NotFoundException("No promocode applied to cart");
    }

    this.detachPromocode(cart);

    await this.cartRepository.save(cart);

    const updatedCart = (await this.cartRepository.findByUserId(userId)) ?? cart;

    return CartResponseDto.fromEntity(updatedCart, priceCart(updatedCart));
  }

  async addItem(userId: string, pizzaId: string, quantity: number): Promise<CartItem> {
    const snapshot = await this.pizzaSnapshots.findById(pizzaId);

    if (!snapshot || !snapshot.isAvailable) {
      throw new NotFoundException("Pizza not found");
    }

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

  detachPromocode(cart: Cart): void {
    cart.promocodeId = null;
    cart.promocodeCode = null;
    cart.promocodeDiscount = null;
    cart.promocodeDiscountType = null;
    cart.promocodeValidTill = null;
  }

  async clearForOrder(userId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return;
    }

    await this.cartItemsRepository.removeAllByCartId(cart.id);

    if (cart.promocodeId) {
      this.detachPromocode(cart);
      await this.cartRepository.save(cart);
    }
  }

  async deleteForUser(userId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return;
    }

    await this.cartItemsRepository.removeAllByCartId(cart.id);
    await this.cartRepository.remove(cart.id);
  }

  async detachPromocodeEverywhere(promocodeId: string): Promise<void> {
    await this.cartRepository.clearPromocode(promocodeId);
  }
}
