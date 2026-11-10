import type { ClientProxy } from "@nestjs/microservices";
import type { CartResponseDto } from "../../cart-service/dto/cart-response.dto.ts";
import type { CartItemResponseDto } from "../../cart-service/cart-items/dto/cart-item-response.dto.ts";
export declare class CartClient {
    private readonly client;
    constructor(client: ClientProxy);
    getCart(userId: string): Promise<CartResponseDto>;
    addItem(userId: string, pizzaId: string, quantity: number): Promise<CartItemResponseDto>;
    updateItemQuantity(userId: string, pizzaId: string, quantity: number): Promise<CartItemResponseDto | null>;
    removeItem(userId: string, pizzaId: string): Promise<{
        ok: true;
    }>;
    clearCart(userId: string): Promise<{
        ok: true;
    }>;
    applyPromocode(userId: string, code: string): Promise<CartResponseDto>;
    removePromocode(userId: string): Promise<CartResponseDto>;
}
