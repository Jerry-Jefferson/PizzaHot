import type { DiscountMode } from "../contracts/index.ts";

export interface PriceCalculationResult {
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export interface PriceableItem {
  price: number;
  quantity: number;
}

export interface PriceablePromocode {
  discount: number | null;
  discountMode: DiscountMode | null;
  validTill: Date | null;
}
