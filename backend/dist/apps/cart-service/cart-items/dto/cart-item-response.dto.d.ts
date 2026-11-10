import type { CartItem } from "../cart-item.entity.ts";
import { CartPizzaDto } from "../../dto/cart-pizza.dto.ts";
export declare class CartItemResponseDto {
    id: string;
    pizza: CartPizzaDto | null;
    quantity: number;
    static fromEntity(cartItem: CartItem): CartItemResponseDto;
}
