import type { ClientProxy } from "@nestjs/microservices";
import type { ICartRepository } from "./cart.types.ts";
import type { ICartItemsRepository } from "./cart.types.ts";
import { PizzaSnapshotRepository } from "./snapshots/pizza-snapshot.repository.ts";
import { CartResponseDto } from "./dto/cart-response.dto.ts";
import { Cart } from "./cart.entity.ts";
import { CartItemResponseDto } from "./cart-items/dto/cart-item-response.dto.ts";
export declare class CartService {
    private readonly cartRepository;
    private readonly cartItemsRepository;
    private readonly pizzaSnapshots;
    private readonly promocodeClient;
    constructor(cartRepository: ICartRepository, cartItemsRepository: ICartItemsRepository, pizzaSnapshots: PizzaSnapshotRepository, promocodeClient: ClientProxy);
    getCart(userId: string): Promise<CartResponseDto>;
    getCartEntity(userId: string): Promise<Cart | null>;
    applyPromocode(userId: string, code: string): Promise<CartResponseDto>;
    removePromocode(userId: string): Promise<CartResponseDto>;
    addItem(userId: string, pizzaId: string, quantity: number): Promise<CartItemResponseDto>;
    private reload;
    updateItemQuantity(userId: string, pizzaId: string, quantity: number): Promise<CartItemResponseDto | null>;
    removeItem(userId: string, pizzaId: string): Promise<void>;
    clearCart(userId: string): Promise<void>;
    detachPromocode(cart: Cart): void;
    clearForOrder(userId: string): Promise<void>;
    deleteForUser(userId: string): Promise<void>;
    detachPromocodeEverywhere(promocodeId: string): Promise<void>;
}
