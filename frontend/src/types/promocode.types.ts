export const DiscountMode = {
  PERCENTAGE: "percentage",
  FIXED_AMOUNT: "fixed_amount",
} as const;

export type DiscountMode = (typeof DiscountMode)[keyof typeof DiscountMode];

export interface Promocode {
  id: string;
  code: string;
  discount: number;
  discountMode: DiscountMode;
  validTill: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PromocodePayload {
  code: string;
  discount: number;
  discountMode: DiscountMode;
  validTill: string;
}
