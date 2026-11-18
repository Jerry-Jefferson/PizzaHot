import type { FormErrors } from "./form.types";

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

export type PromocodeState = "active" | "expired" | "inactive";

export type PromocodeFormMode = "create" | "edit";

export interface PromocodeFormValues {
  code: string;
  discount: number | null;
  discountMode: DiscountMode;
  validTill: Date | null;
}

export type PromocodeField = keyof PromocodeFormValues;

export type PromocodeFormErrors = FormErrors<PromocodeField>;
