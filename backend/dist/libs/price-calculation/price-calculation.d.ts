import { DiscountMode } from "../contracts/index.ts";
import type { PriceCalculationResult, PriceableItem, PriceablePromocode } from "./price-calculation.types.ts";
export declare function calculateTotalPrice(items: PriceableItem[]): number;
export declare function calculateDiscount(promocode: PriceablePromocode | null, totalPrice: number): number;
export declare function calculatePrice(items: PriceableItem[], promocode: PriceablePromocode | null): PriceCalculationResult;
export declare function priceCart(cart: {
    cartItems?: {
        quantity: number;
        pizza?: {
            price: number;
        } | null;
    }[] | null;
    promocodeDiscount: number | null;
    promocodeDiscountMode: DiscountMode | null;
    promocodeValidTill: Date | null;
}): PriceCalculationResult;
