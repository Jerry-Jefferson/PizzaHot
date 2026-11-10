import { type Relation } from "typeorm";
import type { CartItem } from "./cart-items/cart-item.entity.ts";
import { DiscountMode } from "../../libs/contracts/index.ts";
export declare class Cart {
    id: string;
    userId: string;
    cartItems: Relation<CartItem[]>;
    promocodeId: string | null;
    promocodeCode: string | null;
    promocodeDiscount: number | null;
    promocodeDiscountMode: DiscountMode | null;
    promocodeValidTill: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
