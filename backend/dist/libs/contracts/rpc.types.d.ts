import type { DiscountMode } from "./discount-mode.constant.ts";
export interface CheckoutSnapshot {
    cartId: string;
    promocodeId: string | null;
    items: {
        pizzaId: string;
        quantity: number;
    }[];
}
export interface ResolvedPizza {
    pizzaId: string;
    name: string;
    price: number;
    isAvailable: boolean;
}
export interface AvailablePromocode {
    id: string;
    code: string;
    discount: number;
    discountMode: DiscountMode;
    validTill: string;
}
export interface ReservedPromocode {
    promocode: AvailablePromocode;
}
