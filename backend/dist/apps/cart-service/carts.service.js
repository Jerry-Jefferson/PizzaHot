var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CART_REPOSITORY, CART_ITEMS_REPOSITORY } from "../../libs/database/tokens.js";
import { PROMOCODE_CLIENT } from "../../libs/messaging/tokens.constant.js";
import { RPC } from "../../libs/contracts/index.js";
import { rpc } from "../../libs/messaging/rpc.util.js";
import { PizzaSnapshotRepository } from "./snapshots/pizza-snapshot.repository.js";
import { CartResponseDto } from "./dto/cart-response.dto.js";
import { MAX_PIZZA_QUANTITY } from "../../libs/contracts/order-limit.constant.js";
import { priceCart } from "../../libs/price-calculation/price-calculation.js";
import { CartItemResponseDto } from "./cart-items/dto/cart-item-response.dto.js";
let CartService = class CartService {
    cartRepository;
    cartItemsRepository;
    pizzaSnapshots;
    promocodeClient;
    constructor(cartRepository, cartItemsRepository, pizzaSnapshots, promocodeClient) {
        this.cartRepository = cartRepository;
        this.cartItemsRepository = cartItemsRepository;
        this.pizzaSnapshots = pizzaSnapshots;
        this.promocodeClient = promocodeClient;
    }
    async getCart(userId) {
        const cart = await this.cartRepository.findOrCreate(userId);
        return CartResponseDto.fromEntity(cart, priceCart(cart));
    }
    async getCartEntity(userId) {
        return this.cartRepository.findByUserId(userId);
    }
    async applyPromocode(userId, code) {
        const promocode = await rpc(this.promocodeClient, RPC.promocode.checkAvailable, { userId, code: code.trim().toUpperCase() });
        const cart = await this.cartRepository.findOrCreate(userId);
        if (cart.promocodeId) {
            throw new BadRequestException("Only one promocode can be applied to the cart");
        }
        cart.promocodeId = promocode.id;
        cart.promocodeCode = promocode.code;
        cart.promocodeDiscount = Number(promocode.discount);
        cart.promocodeDiscountMode = promocode.discountMode;
        cart.promocodeValidTill = new Date(promocode.validTill);
        await this.cartRepository.save(cart);
        const updatedCart = (await this.cartRepository.findByUserId(userId)) ?? cart;
        return CartResponseDto.fromEntity(updatedCart, priceCart(updatedCart));
    }
    async removePromocode(userId) {
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
    async addItem(userId, pizzaId, quantity) {
        const snapshot = await this.pizzaSnapshots.findById(pizzaId);
        if (!snapshot || !snapshot.isAvailable) {
            throw new NotFoundException("Pizza not found");
        }
        const cart = await this.cartRepository.findOrCreate(userId);
        const existingItem = await this.cartItemsRepository.findByCartAndPizza(cart.id, pizzaId);
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > MAX_PIZZA_QUANTITY) {
                throw new BadRequestException(`Quantity cannot exceed ${MAX_PIZZA_QUANTITY} (current: ${existingItem.quantity})`);
            }
            existingItem.quantity = newQuantity;
            await this.cartItemsRepository.save(existingItem);
            return this.reload(cart.id, pizzaId);
        }
        const cartItem = this.cartItemsRepository.create({
            cart: { id: cart.id },
            pizza: { id: pizzaId },
            quantity,
        });
        await this.cartItemsRepository.save(cartItem);
        return this.reload(cart.id, pizzaId);
    }
    async reload(cartId, pizzaId) {
        const cartItem = await this.cartItemsRepository.findByCartAndPizza(cartId, pizzaId);
        if (!cartItem) {
            throw new NotFoundException("Pizza not found in cart");
        }
        return CartItemResponseDto.fromEntity(cartItem);
    }
    async updateItemQuantity(userId, pizzaId, quantity) {
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
        await this.cartItemsRepository.save(cartItem);
        return this.reload(cart.id, pizzaId);
    }
    async removeItem(userId, pizzaId) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            throw new NotFoundException("Cart not found");
        }
        const removed = await this.cartItemsRepository.removeByCartAndPizza(cart.id, pizzaId);
        if (!removed) {
            throw new NotFoundException("Pizza not found in cart");
        }
    }
    async clearCart(userId) {
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
    detachPromocode(cart) {
        cart.promocodeId = null;
        cart.promocodeCode = null;
        cart.promocodeDiscount = null;
        cart.promocodeDiscountMode = null;
        cart.promocodeValidTill = null;
    }
    async clearForOrder(userId) {
        await this.clearCart(userId);
    }
    async deleteForUser(userId) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            return;
        }
        await this.cartItemsRepository.removeAllByCartId(cart.id);
        await this.cartRepository.remove(cart.id);
    }
    async detachPromocodeEverywhere(promocodeId) {
        await this.cartRepository.clearPromocode(promocodeId);
    }
};
CartService = __decorate([
    Injectable(),
    __param(0, Inject(CART_REPOSITORY)),
    __param(1, Inject(CART_ITEMS_REPOSITORY)),
    __param(3, Inject(PROMOCODE_CLIENT)),
    __metadata("design:paramtypes", [Object, Object, PizzaSnapshotRepository, Function])
], CartService);
export { CartService };
//# sourceMappingURL=carts.service.js.map