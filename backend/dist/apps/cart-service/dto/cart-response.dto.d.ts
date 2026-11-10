import type { Cart } from "../cart.entity.ts";
import { CartPromocodeDto } from "./cart-promocode.dto.ts";
import { CartItemResponseDto } from "../cart-items/dto/cart-item-response.dto.ts";
export declare class CartResponseDto {
    id: string;
    cartItems: CartItemResponseDto[];
    promocode: CartPromocodeDto | null;
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(cart: Cart, pricing: {
        totalPrice: number;
        discountAmount: number;
        finalPrice: number;
    }): CartResponseDto;
}
