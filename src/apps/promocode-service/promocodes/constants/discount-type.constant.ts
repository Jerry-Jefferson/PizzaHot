export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
}

export const DISCOUNT_TYPES = [DiscountType.PERCENTAGE, DiscountType.FIXED_AMOUNT] as const;

export type DiscountTypeValue = (typeof DISCOUNT_TYPES)[number];
