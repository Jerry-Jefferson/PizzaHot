export const DiscountMode = {
  PERCENTAGE: "percentage",
  FIXED_AMOUNT: "fixed_amount",
} as const;

export type DiscountMode = (typeof DiscountMode)[keyof typeof DiscountMode];

export const DISCOUNT_MODES = [DiscountMode.PERCENTAGE, DiscountMode.FIXED_AMOUNT] as const;

export type DiscountValue = (typeof DISCOUNT_MODES)[number];
