import type { Cart } from "../cart.entity.ts";
import type { DiscountMode } from "../../../libs/contracts/index.ts";
export declare class CartPromocodeDto {
    id: string;
    code: string;
    discount: number;
    discountMode: DiscountMode;
    validTill: Date;
    static fromCart(cart: Cart): CartPromocodeDto | null;
}
