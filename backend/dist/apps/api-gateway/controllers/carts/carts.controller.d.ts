import { CartClient } from "../../clients/cart.client.ts";
import type { JwtPayload } from "../../../../libs/auth/jwt-payload.schema.ts";
import { AddCartItemDto } from "../../../cart-service/cart-items/dto/add-cart-item.dto.ts";
import { UpdateCartItemDto } from "../../../cart-service/cart-items/dto/update-cart-item.dto.ts";
import { ApplyPromocodeDto } from "../../../cart-service/dto/apply-promocode.dto.ts";
import { CartResponseDto } from "../../../cart-service/dto/cart-response.dto.ts";
import type { Response } from "express";
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartClient);
    getCart(user: JwtPayload): Promise<CartResponseDto>;
    applyPromocode(user: JwtPayload, dto: ApplyPromocodeDto): Promise<CartResponseDto>;
    removePromocode(user: JwtPayload): Promise<CartResponseDto>;
    addItem(user: JwtPayload, dto: AddCartItemDto): Promise<import("../../../cart-service/cart-items/dto/cart-item-response.dto.ts").CartItemResponseDto>;
    updateItemQuantity(user: JwtPayload, pizzaId: string, dto: UpdateCartItemDto, res: Pick<Response, "status">): Promise<import("../../../cart-service/cart-items/dto/cart-item-response.dto.ts").CartItemResponseDto>;
    removeItem(user: JwtPayload, pizzaId: string): Promise<void>;
    clearCart(user: JwtPayload): Promise<void>;
}
